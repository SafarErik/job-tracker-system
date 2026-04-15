import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideX, lucideSettings, lucideTrash2, lucideSave } from '@ng-icons/lucide';
import { UiStateService } from '../../../../../core/services/ui-state.service';
import { JobApplicationStore } from '../../../services/job-application.store';
import { JobApplicationStatus } from '../../../models/application-status.enum';
import { JobPriority } from '../../../models/job-priority.enum';
import { JobType } from '../../../models/job-type.enum';
import { toast } from 'ngx-sonner';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-job-settings-sheet',
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
    providers: [
        provideIcons({
            lucideX,
            lucideSettings,
            lucideTrash2,
            lucideSave
        })
    ],
    templateUrl: './job-settings-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobSettingsSheetComponent {
    private fb = inject(FormBuilder);
    private transloco = inject(TranslocoService);
    public uiState = inject(UiStateService);
    public store = inject(JobApplicationStore);

    form: FormGroup = this.fb.group({
        companyName: [{ value: '', disabled: true }],
        position: ['', Validators.required],
        jobUrl: [''],
        status: [null, Validators.required],
        priority: [null, Validators.required],
        salaryMin: [''],
        salaryMax: [''],
        currency: ['USD'],
        jobType: [null, Validators.required],
        workplaceType: ['Remote']
    });

    // Expose Enums to Template
    JobApplicationStatus = JobApplicationStatus;
    JobPriority = JobPriority;

    statusOptions = [
        { value: JobApplicationStatus.Applied, labelKey: 'workstation.status.Applied' },
        { value: JobApplicationStatus.PhoneScreen, labelKey: 'workstation.status.PhoneScreen' },
        { value: JobApplicationStatus.TechnicalTask, labelKey: 'workstation.status.TechnicalTask' },
        { value: JobApplicationStatus.Interviewing, labelKey: 'workstation.status.Interviewing' },
        { value: JobApplicationStatus.Offer, labelKey: 'workstation.status.Offer' },
        { value: JobApplicationStatus.Accepted, labelKey: 'workstation.status.Accepted' },
        { value: JobApplicationStatus.Rejected, labelKey: 'workstation.status.Rejected' },
        { value: JobApplicationStatus.Ghosted, labelKey: 'workstation.status.Ghosted' },
    ];

    priorityOptions = [
        { value: JobPriority.Low, labelKey: 'workstation.priority.low' },
        { value: JobPriority.Medium, labelKey: 'workstation.priority.medium' },
        { value: JobPriority.High, labelKey: 'workstation.priority.high' },
    ];

    locationOptions = [
        { value: 'Remote', labelKey: 'workstation.roleDetails.workplace.remote' },
        { value: 'Hybrid', labelKey: 'workstation.roleDetails.workplace.hybrid' },
        { value: 'On-site', labelKey: 'workstation.roleDetails.workplace.onsite' },
    ];

    jobTypeOptions = [
        { value: JobType.FullTime, labelKey: 'workstation.roleDetails.jobType.fullTime' },
        { value: JobType.PartTime, labelKey: 'workstation.roleDetails.jobType.partTime' },
        { value: JobType.Internship, labelKey: 'workstation.roleDetails.jobType.internship' },
        { value: JobType.Contract, labelKey: 'workstation.roleDetails.jobType.contract' },
        { value: JobType.Freelance, labelKey: 'workstation.roleDetails.jobType.freelance' },
    ];

    constructor() {
        effect(() => {
            const app = this.store.selectedApplication();
            if (app) {
                this.form.patchValue({
                    companyName: app.companyName,
                    position: app.position,
                    jobUrl: app.jobUrl,
                    status: app.status,
                    priority: app.priority,
                    salaryMin: app.baseSalary,
                    salaryMax: app.salaryOffer,
                    jobType: app.jobType,
                    workplaceType: app.workplaceType || 'Remote'
                });
            }
        });
    }

    save() {
        if (this.form.valid) {
            const app = this.store.selectedApplication();
            if (app) {
                const changes = {
                    position: this.form.get('position')?.value,
                    jobUrl: this.form.get('jobUrl')?.value,
                    status: this.form.get('status')?.value,
                    priority: this.form.get('priority')?.value,
                    baseSalary: this.form.get('salaryMin')?.value === '' || this.form.get('salaryMin')?.value == null ? undefined : Number(this.form.get('salaryMin')?.value),
                    salaryOffer: this.form.get('salaryMax')?.value === '' || this.form.get('salaryMax')?.value == null ? undefined : Number(this.form.get('salaryMax')?.value),
                    currency: this.form.get('currency')?.value,
                    jobType: this.form.get('jobType')?.value,
                    workplaceType: this.form.get('workplaceType')?.value
                };

                this.store.updateApplication(app.id, changes);
                toast.success(this.transloco.translate('workstation.roleDetails.notifications.saved.title'), {
                    description: this.transloco.translate('workstation.roleDetails.notifications.saved.body')
                });
                this.uiState.closeJobSettings();
            }
        }
    }

    delete() {
        const app = this.store.selectedApplication();
        if (app) {
            if (confirm(this.transloco.translate('workstation.roleDetails.deleteConfirm', { company: app.companyName }))) {
                this.store.deleteApplication(app.id);
                this.uiState.closeJobSettings();
            }
        }
    }
}
