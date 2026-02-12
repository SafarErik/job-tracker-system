import { Component, ChangeDetectionStrategy, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSheetImports, HlmSheet } from '@spartan-ng/helm/sheet';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { NotificationService } from '../../../../core/services';
import { toast } from 'ngx-sonner';
import { JobApplicationStore } from '../../services/job-application.store';
import { CompanyStore } from '../../../companies/services/company.store';
import { CompanyPriority } from '../../../companies/models/company-priority.enum';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobPriority } from '../../models/job-priority.enum';
import { CreateJobApplication } from '../../models/job-application.model';
import { getStatusStyle } from '../../models/status-styles.util';
import { provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
    selector: 'app-application-add-sheet',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ...HlmSheetImports,
        ...HlmInputImports,
        ...HlmButtonImports,
        ...HlmLabelImports,
        ...HlmSelectImports,
        ...BrnSelectImports,
        ...HlmIconImports,
        ...BrnSheetImports,
    ],
    providers: [provideIcons({ lucideSparkles, lucideX })],
    templateUrl: './application-add-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationAddSheetComponent {
    private fb = inject(FormBuilder);
    public uiState = inject(UiStateService);
    public store = inject(JobApplicationStore);
    public companyStore = inject(CompanyStore);
    private notificationService = inject(NotificationService);

    // Controlled by parent/service now
    // @ViewChild(HlmSheet) sheet!: HlmSheet; 

    form: FormGroup = this.fb.group({
        jobUrl: [''],
        position: ['', Validators.required],
        companyName: ['', Validators.required],
        status: [JobApplicationStatus.Applied, Validators.required],
        priority: [JobPriority.Medium, Validators.required],
        salaryMin: ['', Validators.pattern(/^\d*\.?\d*$/)],
        salaryMax: ['', Validators.pattern(/^\d*\.?\d*$/)],
    });

    // Mock Auto-Fill Loading State
    isAutoFilling = signal(false);

    // Expose Enums to Template
    JobApplicationStatus = JobApplicationStatus;
    JobPriority = JobPriority;

    statusOptions = [
        { value: JobApplicationStatus.Applied, label: getStatusStyle(JobApplicationStatus.Applied).label },
        { value: JobApplicationStatus.PhoneScreen, label: getStatusStyle(JobApplicationStatus.PhoneScreen).label },
        { value: JobApplicationStatus.TechnicalTask, label: getStatusStyle(JobApplicationStatus.TechnicalTask).label },
        { value: JobApplicationStatus.Interviewing, label: getStatusStyle(JobApplicationStatus.Interviewing).label },
        { value: JobApplicationStatus.Offer, label: getStatusStyle(JobApplicationStatus.Offer).label },
        { value: JobApplicationStatus.Accepted, label: getStatusStyle(JobApplicationStatus.Accepted).label },
        { value: JobApplicationStatus.Rejected, label: getStatusStyle(JobApplicationStatus.Rejected).label },
        { value: JobApplicationStatus.Ghosted, label: getStatusStyle(JobApplicationStatus.Ghosted).label },
    ];

    public autoFill() {
        this.isAutoFilling.set(true);
        setTimeout(() => {
            this.form.patchValue({
                jobUrl: 'https://careers.google.com/jobs/results/1234',
                position: 'Senior Frontend Engineer',
                companyName: 'Google',
                salaryMin: '120000',
                salaryMax: '180000'
            });
            this.isAutoFilling.set(false);
        }, 1500);
    }

    onSubmit() {
        if (this.form.valid) {
            this.form.disable(); // Prevent multiple submissions
            const formData = this.form.value;
            const companyName = formData.companyName.trim();

            // 1. Try to find existing company
            const existingCompany = this.companyStore.companies().find(c =>
                c.name.toLowerCase() === companyName.toLowerCase()
            );

            if (existingCompany) {
                this.createApplication(existingCompany.id, formData);
            } else {
                // 2. Create new company
                const newCompany = {
                    name: companyName,
                    priority: JobPriority.Medium // Default to Medium for auto-created
                } as any; // Cast to avoid strict type checks on partial CreateCompany if needed

                this.companyStore.create({
                    name: companyName,
                    priority: CompanyPriority.MidTier
                } as any).subscribe({
                    next: (company) => {
                        this.createApplication(company.id, formData);
                    },
                    error: () => {
                        this.notificationService.error('Failed to create company for application', 'Error');
                        this.form.enable();
                    }
                });
            }
        }
    }

    private createApplication(companyId: string, formData: any) {
        const application: CreateJobApplication = {
            position: formData.position,
            companyId: companyId,
            jobUrl: formData.jobUrl,
            status: formData.status,
            priority: formData.priority,
            baseSalary: formData.salaryMin ? Number(formData.salaryMin) : undefined,
            salaryOffer: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        };

        this.store.addApplication(application);

        // Close and Reset
        this.uiState.closeAddAppSheet();
        this.form.reset({
            status: JobApplicationStatus.Applied,
            priority: JobPriority.Medium
        });
        this.form.enable();
    }
}
