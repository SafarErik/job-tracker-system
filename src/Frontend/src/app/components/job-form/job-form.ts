import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Services
import { ApplicationService } from '../../services/application';
import { CompanyService } from '../../services/company';
import { SkillService } from '../../services/skill';

// Models
import { Company } from '../../models/company.model';
import { Skill } from '../../models/skill.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-form.html',
  styleUrl: './job-form.css',
})
export class JobFormComponent implements OnInit {
  jobForm: FormGroup;
  companies: Company[] = [];
  skills: Skill[] = [];

  // UI States
  isLoading = false;
  isSubmitting = false;

  // Enums for HTML access
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

  constructor(
    private fb: FormBuilder,
    private applicationService: ApplicationService,
    private companyService: CompanyService,
    private skillService: SkillService,
    private router: Router,
  ) {
    // Initialize the form structure and validation rules
    this.jobForm = this.fb.group({
      position: ['', [Validators.required, Validators.minLength(3)]],
      companyId: [null, [Validators.required]],
      status: [JobApplicationStatus.Applied, [Validators.required]],
      jobUrl: ['', []], // Optional
      description: ['', []], // Optional
    });
  }

  // Lifecycle hook: Runs when component initializes
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    // Fetch data for dropdowns
    this.companyService.getCompanies().subscribe({
      next: (data) => {
        this.companies = data;
        this.isLoading = false;
      },
      error: (err) => console.error('Failed to load companies', err),
    });

    this.skillService.getSkills().subscribe({
      next: (data) => (this.skills = data),
      error: (err) => console.error('Failed to load skills', err),
    });
  }

  onSubmit() {
    // 1. Check if form is valid
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched(); // Triggers error messages in UI
      return;
    }

    this.isSubmitting = true;
    const formData = this.jobForm.value;

    // Convert string inputs to numbers if necessary (HTML selects can be tricky)
    formData.companyId = Number(formData.companyId);
    formData.status = Number(formData.status);

    // 2. Send data to Backend
    this.applicationService.createApplication(formData).subscribe({
      next: () => {
        // Success: Redirect to list
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert('Failed to save application. Please try again.');
        this.isSubmitting = false;
      },
    });
  }
}
