import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { Company, CreateCompany, UpdateCompany, CompanyDetail, CompanyContact } from '../../models/company.model';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideGlobe, lucideMapPin, lucideBuilding2, lucideLayers, lucideUsers, lucideMail, lucideLinkedin, lucideCheck, lucidePlus, lucideChevronDown, lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgIcon,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft, lucideGlobe, lucideMapPin, lucideBuilding2,
      lucideLayers, lucideUsers, lucideMail, lucideLinkedin,
      lucideCheck, lucidePlus, lucideChevronDown, lucideX
    })
  ],
  templateUrl: './company-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyFormComponent implements OnInit {
  companyForm: FormGroup;
  isEditMode = signal(false);
  companyId = signal<number | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  // New fields & UI State
  industryOptions: string[] = [];
  techStack = signal<string[]>([]);
  newTech = signal('');

  // Dropdown states
  isPriorityDropdownOpen = signal(false);
  isIndustryDropdownOpen = signal(false);

  priorityOptions = [
    { value: 'Tier1', label: 'Tier 1' },
    { value: 'Tier2', label: 'Tier 2' },
    { value: 'Tier3', label: 'Tier 3' },
  ];

  // Store existing contacts to preserve IDs during update
  existingContacts: CompanyContact[] = [];

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private intelligenceService: CompanyIntelligenceService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      website: ['', []],
      address: ['', []],
      industry: ['', []],
      priority: ['Tier3', []],
      hrContactName: ['', []],
      hrContactEmail: ['', [Validators.email]],
      hrContactLinkedIn: ['', []],
    });

    this.industryOptions = this.intelligenceService.getIndustryOptions();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.companyId.set(+id);
      this.loadCompany();
    }
  }

  loadCompany(): void {
    const id = this.companyId();
    if (!id) return;

    this.isLoading.set(true);
    this.error.set(null);

    // Use getCompanyDetails to fetch contacts
    this.companyService.getCompanyDetails(id).subscribe({
      next: (company: CompanyDetail) => {
        // Store contacts
        this.existingContacts = company.contacts || [];
        const primaryContact = this.existingContacts[0];

        this.companyForm.patchValue({
          name: company.name,
          website: company.website || '',
          address: company.address || '',
          industry: company.industry || '',
          priority: company.priority || 'Tier3',
          hrContactName: primaryContact?.name || '',
          hrContactEmail: primaryContact?.email || '',
          hrContactLinkedIn: primaryContact?.linkedIn || '',
        });
        this.techStack.set(company.techStack || []);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load company data');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  // --- Dropdown Management ---
  togglePriority(): void {
    this.isPriorityDropdownOpen.update(v => !v);
  }

  selectPriority(value: string): void {
    this.companyForm.patchValue({ priority: value });
    this.isPriorityDropdownOpen.set(false);
  }

  get selectedPriorityLabel(): string {
    const val = this.companyForm.get('priority')?.value;
    return this.priorityOptions.find(o => o.value === val)?.label || 'Select Priority';
  }

  toggleIndustry(): void {
    this.isIndustryDropdownOpen.update(v => !v);
  }

  selectIndustry(value: string): void {
    this.companyForm.patchValue({ industry: value });
    this.isIndustryDropdownOpen.set(false);
  }

  // --- Tech Stack Management ---
  addTech(): void {
    const tech = this.newTech().trim();
    if (tech && !this.techStack().includes(tech)) {
      this.techStack.update((stack) => [...stack, tech]);
      this.newTech.set('');
    }
  }

  removeTech(index: number, event?: Event): void {
    event?.stopPropagation(); // Prevent triggering container clicks if any
    this.techStack.update((stack) => stack.filter((_, i) => i !== index));
  }

  onTechKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTech();
    }
  }

  // --- Actions ---

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.companyForm.value;

    // Construct Contacts Array
    const contacts: CompanyContact[] = [];
    if (formValue.hrContactName) {
      // If editing, try to preserve the ID of the first contact
      const contactId = this.isEditMode() && this.existingContacts.length > 0 ? this.existingContacts[0].id : 0;

      contacts.push({
        id: contactId,
        name: formValue.hrContactName,
        email: formValue.hrContactEmail,
        linkedIn: formValue.hrContactLinkedIn,
        role: 'Recruiter', // Default role
      });
    }

    const payload = {
      ...formValue,
      website: formValue.website || null, // Ensure empty string becomes null
      address: formValue.address || null,
      techStack: this.techStack(),
      contacts: contacts
    };

    if (this.isEditMode()) {
      const id = this.companyId();
      if (!id) return;

      const updateData: UpdateCompany = payload;
      this.companyService.updateCompany(id, updateData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/companies']);
        },
        error: (err: Error) => {
          this.error.set('Failed to update company');
          this.isSubmitting.set(false);
          console.error(err);
        },
      });
    } else {
      const newCompany: CreateCompany = payload;

      this.companyService.createCompany(newCompany).subscribe({
        next: (company: Company) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/companies']);
        },
        error: (err: Error) => {
          this.error.set('Failed to create company');
          this.isSubmitting.set(false);
          console.error(err);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }

  get name() {
    return this.companyForm.get('name');
  }
  get hrContactEmail() {
    return this.companyForm.get('hrContactEmail');
  }
}
