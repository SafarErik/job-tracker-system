import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

// Services
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Feature Services
import { CompanyService } from '../../../companies/services/company.service';
import { SkillService } from '../../../skills/services/skill.service';
import { DocumentService } from '../../../documents/services/document.service';

// Models
import { Company } from '../../../companies/models/company.model';
import { Skill } from '../../../skills/models/skill.model';
import { Document } from '../../../documents/models/document.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

/**
 * JobFormComponent - Dual-purpose form for creating and editing job applications
 *
 * This component operates in two modes:
 *
 * 1. CREATE MODE (route: /new)
 *    - Empty form with default values
 *    - Submits POST request to create new application
 *
 * 2. EDIT MODE (route: /edit/:id)
 *    - Pre-populated form with existing data
 *    - Submits PUT request to update application
 *
 * The mode is determined by checking if an 'id' parameter exists in the route.
 *
 * Key Angular Concepts:
 * - Reactive Forms: Form validation and state management
 * - Route Parameters: Reading :id from URL using ActivatedRoute
 * - Conditional Rendering: Dynamic UI based on isEditMode flag
 * - HTTP Methods: POST for create, PUT for update
 */
@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './job-form.html',
  styleUrl: './job-form.css',
})
export class JobFormComponent implements OnInit {
  // ============================================
  // Form and Data Properties
  // ============================================

  /**
   * Reactive form instance with validation rules
   * Provides form state tracking and validation
   */
  jobForm: FormGroup;

  /**
   * Dropdown data loaded from backend
   */
  companies: Company[] = [];
  skills: Skill[] = [];
  documents: Document[] = [];
  applications: string[] = [];
  filteredPositions: string[] = [];
  isPositionDropdownOpen = false;
  positionSearchTerm = '';
  filteredCompanies: Company[] = [];
  isCompanyDropdownOpen = false;
  companySearchTerm = '';
  isStatusDropdownOpen = false;
  isDocumentDropdownOpen = false;
  isUploadingDocument = false;
  uploadProgress = 0;
  uploadError = '';

  // ============================================
  // UI State Indicators
  // ============================================

  /**
   * Loading state for initial data fetch
   * Shows spinner while loading companies and application data
   */
  isLoading = false;

  /**
   * Submitting state during form save
   * Disables submit button and shows "Saving..." text
   */
  isSubmitting = false;

  // ============================================
  // Edit Mode Tracking
  // ============================================

  /**
   * Determines if we're editing (true) or creating (false)
   * Affects: form title, submit button text, API call method
   */
  isEditMode = false;

  /**
   * ID of the application being edited (null in create mode)
   * Used to construct the PUT endpoint: /api/applications/{id}
   */
  applicationId: number | null = null;

  // ============================================
  // Template-accessible Enums
  // ============================================

  /**
   * Expose status enum to template for dropdown binding
   */
  Status = JobApplicationStatus;

  // Dropdown options for Status (ALL enum values)
  statusOptions = [
    { value: JobApplicationStatus.Applied, label: 'Applied' },
    { value: JobApplicationStatus.PhoneScreen, label: 'Phone Screen' },
    { value: JobApplicationStatus.TechnicalTask, label: 'Technical Task' },
    { value: JobApplicationStatus.Interviewing, label: 'Interviewing' },
    { value: JobApplicationStatus.Offer, label: 'Offer Received' },
    { value: JobApplicationStatus.Rejected, label: 'Rejected' },
    { value: JobApplicationStatus.Ghosted, label: 'Ghosted' },
  ];

  /**
   * Constructor with Dependency Injection
   *
   * All services are marked 'readonly' because:
   * 1. We never reassign these service instances
   * 2. It's a best practice to prevent accidental mutations
   * 3. Makes code more predictable and easier to debug
   */
  constructor(
    private readonly fb: FormBuilder,
    private readonly applicationService: ApplicationService,
    private readonly companyService: CompanyService,
    private readonly skillService: SkillService,
    private readonly documentService: DocumentService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
  ) {
    // Initialize the form structure and validation rules
    this.jobForm = this.fb.group({
      position: ['', [Validators.required, Validators.minLength(3)]],
      companyId: [null, [Validators.required]],
      companySearch: [''],
      status: [JobApplicationStatus.Applied, [Validators.required]],
      jobUrl: ['', []], // Optional
      description: ['', []], // Optional
      documentId: [null, []], // Optional - CV selection
    });
  }

  /**
   * Lifecycle hook: Runs when component initializes
   * Checks if we're in edit mode by looking for :id in the route
   */
  ngOnInit(): void {
    // Check if we have an ID parameter in the route (e.g., /edit/5)
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Edit mode: we have an ID
      this.isEditMode = true;
      this.applicationId = Number(id);
      this.loadData(); // Load dropdown data first
      this.loadApplication(); // Then load the application to edit
    } else {
      // Create mode: no ID
      this.isEditMode = false;
      this.loadData(); // Just load dropdown data
    }
  }

  /**
   * Load dropdown data (companies and skills)
   * Called on both create and edit modes
   */
  loadData() {
    this.isLoading = true;
    // Fetch data for dropdowns using forkJoin to coordinate both requests
    forkJoin({
      companies: this.companyService.getCompanies(),
      skills: this.skillService.getSkills(),
      documents: this.documentService.getAllDocuments(),
      applications: this.applicationService.getApplications(),
    }).subscribe({
      next: (result) => {
        this.companies = result.companies;
        this.skills = result.skills;
        this.documents = result.documents;
        this.applications = this.getUniquePositions(result.applications);
        this.filteredPositions = this.applications.slice(0, 6);
        this.filteredCompanies = this.companies.slice(0, 6);
        this.syncCompanySearch();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load form data:', err);
        this.notificationService.error(
          'Unable to load companies and skills. Please refresh the page.',
          'Load Error',
        );
        this.isLoading = false;
      },
    });
  }

  /**
   * Load existing application data for editing
   * Only called in edit mode
   */
  loadApplication() {
    if (!this.applicationId) return;

    this.isLoading = true;
    this.applicationService.getApplicationById(this.applicationId).subscribe({
      next: (application) => {
        // Populate the form with existing data
        this.jobForm.patchValue({
          position: application.position,
          companyId: application.companyId,
          status: application.status,
          jobUrl: application.jobUrl || '',
          description: application.description || '',
          documentId: application.documentId || null,
        });
        this.syncCompanySearch();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load application:', err);
        this.notificationService.error(
          'Unable to load application data. Redirecting to home page.',
          'Load Error',
        );
        setTimeout(() => this.router.navigate(['/']), 2000);
        this.isLoading = false;
      },
    });
  }

  /**
   * Handle form submission
   * Determines whether to create or update based on isEditMode
   */
  onSubmit() {
    // 1. Validate form
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched(); // Triggers error messages in UI
      return;
    }

    this.isSubmitting = true;
    const formData = { ...this.jobForm.value };

    delete formData.companySearch;

    // Convert string inputs to numbers if necessary (HTML selects can be tricky)
    formData.companyId = Number(formData.companyId);
    formData.status = Number(formData.status);

    // 2. Determine operation: create or update
    const operation =
      this.isEditMode && this.applicationId
        ? this.applicationService.updateApplication(this.applicationId, formData)
        : this.applicationService.createApplication(formData);

    // 3. Execute the operation
    operation.subscribe({
      next: () => {
        // Success: Show notification and redirect
        const action = this.isEditMode ? 'updated' : 'created';
        const message = `Your job application has been ${action} successfully.`;

        this.notificationService.success(message, 'Success!');

        // Redirect after short delay to let user see the notification
        setTimeout(() => this.router.navigate(['/']), 1000);
      },
      error: (err) => {
        console.error('Failed to save application:', err);
        const action = this.isEditMode ? 'update' : 'save';
        this.notificationService.error(
          `Unable to ${action} your application. Please check your input and try again.`,
          `Failed to ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        );
        this.isSubmitting = false;
      },
    });
  }

  onCompanySearchChange(value: string) {
    this.companySearchTerm = value;
    const normalized = value.trim().toLowerCase();

    this.filteredCompanies = this.companies.filter((company) =>
      company.name.toLowerCase().includes(normalized),
    );

    if (!normalized) {
      this.jobForm.patchValue({ companyId: null });
      return;
    }

    const exactMatch = this.companies.find((company) => company.name.toLowerCase() === normalized);

    if (exactMatch) {
      this.jobForm.patchValue({ companyId: exactMatch.id });
    } else {
      this.jobForm.patchValue({ companyId: null });
    }
  }

  onPositionSearchChange(value: string) {
    this.positionSearchTerm = value;
    const normalized = value.trim().toLowerCase();

    this.filteredPositions = this.applications
      .filter((position) => position.toLowerCase().includes(normalized))
      .slice(0, 6);
  }

  openPositionDropdown() {
    this.isPositionDropdownOpen = true;
  }

  closePositionDropdown() {
    setTimeout(() => {
      this.isPositionDropdownOpen = false;
    }, 150);
  }

  selectPosition(position: string) {
    this.jobForm.patchValue({ position });
    this.positionSearchTerm = position;
    this.isPositionDropdownOpen = false;
  }

  openStatusDropdown() {
    this.isStatusDropdownOpen = true;
  }

  closeStatusDropdown() {
    setTimeout(() => {
      this.isStatusDropdownOpen = false;
    }, 150);
  }

  selectStatus(value: number) {
    this.jobForm.patchValue({ status: value });
    this.isStatusDropdownOpen = false;
  }

  get selectedStatusLabel(): string {
    const value = Number(this.jobForm.get('status')?.value);
    return this.statusOptions.find((option) => option.value === value)?.label ?? 'Select status';
  }

  openDocumentDropdown() {
    this.isDocumentDropdownOpen = true;
  }

  closeDocumentDropdown() {
    setTimeout(() => {
      this.isDocumentDropdownOpen = false;
    }, 150);
  }

  selectDocument(documentId: string | null) {
    this.jobForm.patchValue({ documentId });
    this.isDocumentDropdownOpen = false;
  }

  get selectedDocumentLabel(): string {
    const docId = this.jobForm.get('documentId')?.value as string | null;
    if (!docId) return 'No CV selected';
    return this.documents.find((doc) => doc.id === docId)?.originalFileName ?? 'No CV selected';
  }

  openCompanyDropdown() {
    this.isCompanyDropdownOpen = true;
  }

  closeCompanyDropdown() {
    setTimeout(() => {
      this.isCompanyDropdownOpen = false;
    }, 150);
  }

  selectCompany(company: Company) {
    this.jobForm.patchValue({
      companyId: company.id,
      companySearch: company.name,
    });
    this.companySearchTerm = company.name;
    this.isCompanyDropdownOpen = false;
  }

  get canCreateCompany(): boolean {
    const normalized = this.companySearchTerm.trim().toLowerCase();
    if (!normalized) return false;
    return !this.companies.some((company) => company.name.toLowerCase() === normalized);
  }

  createCompanyFromSearch() {
    const name = this.companySearchTerm.trim();
    if (!name) return;

    this.companyService.createCompany({ name }).subscribe({
      next: (company) => {
        this.companies = [company, ...this.companies];
        this.selectCompany(company);
        this.notificationService.success(
          'Company added and selected for this application.',
          'Company created',
        );
      },
      error: (err) => {
        console.error('Failed to create company:', err);
        this.notificationService.error(
          'Unable to create company right now. Please try again.',
          'Create Company Failed',
        );
      },
    });
  }

  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Client-side validation: check file type and size
    const validMimeTypes = ['application/pdf'];
    const maxFileSizeBytes = 10 * 1024 * 1024; // 10MB

    // Check MIME type
    if (!validMimeTypes.includes(file.type)) {
      this.uploadError = 'Only PDF files are allowed. Please select a valid PDF file.';
      this.isUploadingDocument = false;
      this.uploadProgress = 0;
      // Clear the file input so user can re-select
      input.value = '';
      return;
    }

    // Check file size
    if (file.size > maxFileSizeBytes) {
      this.uploadError = `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`;
      this.isUploadingDocument = false;
      this.uploadProgress = 0;
      // Clear the file input so user can re-select
      input.value = '';
      return;
    }

    // Validation passed, proceed with upload
    this.isUploadingDocument = true;
    this.uploadProgress = 0;
    this.uploadError = '';

    this.documentService.uploadDocumentWithProgress(file).subscribe({
      next: (result) => {
        if (typeof result === 'number') {
          this.uploadProgress = result;
        } else {
          this.documents = [result, ...this.documents];
          this.jobForm.patchValue({ documentId: result.id });
          this.isUploadingDocument = false;
          this.notificationService.success('Your CV was uploaded and selected.', 'Upload complete');
        }
      },
      error: (err) => {
        console.error('Failed to upload document:', err);
        this.isUploadingDocument = false;
        this.uploadError = 'Upload failed. Please try again.';
      },
    });
  }

  private syncCompanySearch() {
    const companyId = this.jobForm.get('companyId')?.value;
    if (!companyId || !this.companies.length) return;
    const match = this.companies.find((company) => company.id === Number(companyId));
    if (match) {
      this.jobForm.patchValue({ companySearch: match.name });
      this.companySearchTerm = match.name;
    }
  }

  private getUniquePositions(applications: { position: string }[]): string[] {
    const positions = applications
      .map((application) => application.position?.trim())
      .filter((position): position is string => Boolean(position));

    return Array.from(new Set(positions)).sort((a, b) => a.localeCompare(b));
  }
}
