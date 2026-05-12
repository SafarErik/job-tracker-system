import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { LanguageService, NotificationService, UiStateService } from '../../../../core/services';
import { JobApplicationStore } from '../../services/job-application.store';
import { CompanyStore } from '../../../companies/services/company.store';
import { CompanyPriority } from '../../../companies/models/company-priority.enum';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobPriority } from '../../models/job-priority.enum';
import { CreateJobApplication } from '../../models/job-application.model';
import { provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

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
        TranslocoPipe,
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
    private languageService = inject(LanguageService);
    private transloco = inject(TranslocoService);

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
        { value: JobApplicationStatus.Applied, labelKey: 'dashboard.workQueue.status.Applied' },
        { value: JobApplicationStatus.PhoneScreen, labelKey: 'dashboard.workQueue.status.PhoneScreen' },
        { value: JobApplicationStatus.TechnicalTask, labelKey: 'dashboard.workQueue.status.TechnicalTask' },
        { value: JobApplicationStatus.Interviewing, labelKey: 'dashboard.workQueue.status.Interviewing' },
        { value: JobApplicationStatus.Offer, labelKey: 'dashboard.workQueue.status.Offer' },
        { value: JobApplicationStatus.Accepted, labelKey: 'dashboard.workQueue.status.Accepted' },
        { value: JobApplicationStatus.Rejected, labelKey: 'dashboard.workQueue.status.Rejected' },
        { value: JobApplicationStatus.Ghosted, labelKey: 'dashboard.workQueue.status.Ghosted' },
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
                        this.notificationService.error(
                            this.t('applications.addSheet.errors.companyCreate'),
                            this.t('common.states.error', undefined, 'Error'),
                        );
                        this.form.enable();
                    }
                });
            }
        } else {
            this.form.markAllAsTouched();
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

    private t(key: string, params?: Record<string, unknown>, fallback?: string): string {
        this.languageService.locale();
        return this.transloco.translate(key, params) || fallback || key;
    }
}
