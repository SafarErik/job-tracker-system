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
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobPriority } from '../../models/job-priority.enum';
import { getStatusStyle } from '../../models/status-styles.util';
import { provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideX } from '@ng-icons/lucide';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
    selector: 'app-application-add-sheet',
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
    providers: [provideIcons({ lucideSparkles, lucideX })],
    templateUrl: './application-add-sheet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationAddSheetComponent {
    private fb = inject(FormBuilder);
    public uiState = inject(UiStateService);
    private notificationService = inject(NotificationService);

    // Controlled by parent/service now
    // @ViewChild(HlmSheet) sheet!: HlmSheet; 

    form: FormGroup = this.fb.group({
        jobUrl: [''],
        position: ['', Validators.required],
        company: ['', Validators.required],
        department: [''], // Optional
        status: [JobApplicationStatus.Applied, Validators.required],
        priority: [JobPriority.Medium, Validators.required],
        location: [''],
        salaryMin: [''],
        salaryMax: [''],
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
                company: 'Google',
                department: 'YouTube Team',
                location: 'London, UK (Hybrid)',
                salaryMin: '120000',
                salaryMax: '180000'
            });
            this.isAutoFilling.set(false);
        }, 1500);
    }

    onSubmit() {
        if (this.form.valid) {
            console.log('Form Submitted', this.form.value);
            // Simulate API call success

            // 1. Close the sheet
            this.uiState.closeAddAppSheet();

            // 2. Show Success Toast
            const company = this.form.get('company')?.value || 'Unknown Company';
            this.notificationService.success(`Application created for ${company}`);

            // 3. Reset form (optional, but good practice)
            this.form.reset({
                status: JobApplicationStatus.Applied,
                priority: JobPriority.Medium
            });
        }
    }
}
