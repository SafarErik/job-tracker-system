import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { Company, CreateCompany, UpdateCompany } from '../../models/company.model';

@Component({
  selector: 'app-company-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './company-form.html',
  styleUrl: './company-form.css',
})
export class CompanyFormComponent implements OnInit {
  companyForm: FormGroup;
  isEditMode = signal(false);
  companyId = signal<number | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      website: ['', []],
      address: ['', []],
      hrContactName: ['', []],
      hrContactEmail: ['', [Validators.email]],
      hrContactLinkedIn: ['', []],
    });
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

    this.companyService.getCompanyById(id).subscribe({
      next: (company: Company) => {
        this.companyForm.patchValue({
          name: company.name,
          website: company.website || '',
          address: company.address || '',
          hrContactName: company.hrContactName || '',
          hrContactEmail: company.hrContactEmail || '',
          hrContactLinkedIn: company.hrContactLinkedIn || '',
        });
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Failed to load company data');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.companyForm.value;

    if (this.isEditMode()) {
      // Update existing company
      const id = this.companyId();
      if (!id) return;

      const updateData: UpdateCompany = formValue;
      this.companyService.updateCompany(id, updateData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/company', id]);
        },
        error: (err: Error) => {
          this.error.set('Failed to update company');
          this.isSubmitting.set(false);
          console.error(err);
        },
      });
    } else {
      // Create new company
      const newCompany: CreateCompany = formValue;

      this.companyService.createCompany(newCompany).subscribe({
        next: (company: Company) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/company', company.id]);
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
