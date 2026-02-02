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
import { lucideX, lucideSettings, lucideTrash2, lucideSave, lucideAlertCircle } from '@ng-icons/lucide';
import { UiStateService } from '../../../../../core/services/ui-state.service';
import { JobApplicationStore } from '../../../services/job-application.store';
import { JobApplicationStatus } from '../../../models/application-status.enum';
import { JobPriority } from '../../../models/job-priority.enum';
import { JobType } from '../../../models/job-type.enum';
import { getStatusStyle } from '../../../models/status-styles.util';
import { toast } from 'ngx-sonner';

@Component({
    selector: 'app-job-settings-sheet',
    standalone: true,
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
    providers: [
        provideIcons({
            lucideX,
            lucideSettings,
            lucideTrash2,
            lucideSave,
            lucideAlertCircle
        })
    ],
    templateUrl: './job-settings-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobSettingsSheetComponent {
    private fb = inject(FormBuilder);
    public uiState = inject(UiStateService);
    public store = inject(JobApplicationStore);

    form: FormGroup = this.fb.group({
        companyName: [{ value: '', disabled: true }],
        position: ['', Validators.required],
        jobUrl: [''],
        status: [null, Validators.required],
        priority: [null, Validators.required],
        salaryMin: [''],
        currency: ['USD'],
        jobType: [null, Validators.required],
        location: [''],
        notes: ['']
    });

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

    priorityOptions = [
        { value: JobPriority.Low, label: 'Low' },
        { value: JobPriority.Medium, label: 'Medium' },
        { value: JobPriority.High, label: 'High' },
    ];

    locationOptions = [
        { value: 'Remote', label: 'Remote' },
        { value: 'Hybrid', label: 'Hybrid' },
        { value: 'On-site', label: 'On-site' },
    ];

    jobTypeOptions = [
        { value: JobType.FullTime, label: 'Full-Time' },
        { value: JobType.PartTime, label: 'Part-Time' },
        { value: JobType.Internship, label: 'Internship' },
        { value: JobType.Contract, label: 'Contract' },
        { value: JobType.Freelance, label: 'Freelance' },
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
                    salaryMin: app.salaryMin,
                    jobType: app.jobType,
                    location: app.location || 'Remote',
                    notes: app.description // Using description as tactical context for now as per model
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
                    salaryMin: Number(this.form.get('salaryMin')?.value) || undefined,
                    jobType: this.form.get('jobType')?.value,
                    location: this.form.get('location')?.value,
                    description: this.form.get('notes')?.value
                };

                this.store.updateApplication(app.id, changes);
                toast.success('Settings Updated', { description: 'Changes saved successfully.' });
                this.uiState.closeJobSettings();
            }
        }
    }

    delete() {
        const app = this.store.selectedApplication();
        if (app) {
            if (confirm(`Are you sure you want to delete the application for ${app.companyName}?`)) {
                this.store.deleteApplication(app.id);
                this.uiState.closeJobSettings();
            }
        }
    }
}
