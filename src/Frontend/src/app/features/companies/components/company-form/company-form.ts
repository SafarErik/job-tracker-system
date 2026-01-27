import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { Company, CreateCompany, UpdateCompany } from '../../models/company.model';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-company-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ...HlmButtonImports, ...HlmInputImports, ...HlmLabelImports],
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

  // New fields
  industryOptions: string[] = [];
  techStack = signal<string[]>([]);
  newTech = signal('');

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

    this.companyService.getCompanyById(id).subscribe({
      next: (company: Company) => {
        this.companyForm.patchValue({
          name: company.name,
          website: company.website || '',
          address: company.address || '',
          industry: company.industry || '',
          hrContactName: company.hrContactName || '',
          hrContactEmail: company.hrContactEmail || '',
          hrContactLinkedIn: company.hrContactLinkedIn || '',
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

  // Tech Stack Management
  addTech(): void {
    const tech = this.newTech().trim();
    if (tech && !this.techStack().includes(tech)) {
      this.techStack.update((stack) => [...stack, tech]);
      this.newTech.set('');
    }
  }

  removeTech(index: number): void {
    this.techStack.update((stack) => stack.filter((_, i) => i !== index));
  }

  onTechKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTech();
    }
  }

  onSubmit(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = {
      ...this.companyForm.value,
      techStack: this.techStack(),
    };

    if (this.isEditMode()) {
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

