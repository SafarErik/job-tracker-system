import {
    Component,
    input,
    computed,
    output,
    ChangeDetectionStrategy,
    signal,
} from '@angular/core';
import {
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
    HlmCardFooter,
} from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

/**
 * Job Card Component
 * Enhanced visual card for displaying job applications in grid view.
 * Features: Company logos, stale indicators, progress bars, and workstation CTA.
 */
@Component({
    selector: 'app-job-card',
    imports: [
        CommonModule,
        HlmCard,
        HlmCardHeader,
        HlmCardTitle,
        HlmCardDescription,
        HlmCardContent,
        HlmCardFooter,
        HlmBadge,
        ...HlmButtonImports,
    ],
    templateUrl: './job-card.html',
    styleUrl: './job-card.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardComponent {
    // Inputs
    application = input.required<JobApplication>();

    // Outputs
    openWorkstation = output<number>();
    openJobUrl = output<string>();

    // Logo loading state
    logoFailed = signal(false);

    // Status enum for template
    Status = JobApplicationStatus;

    // Computed: Company logo URL from Clearbit
    logoUrl = computed(() => {
        const companyName = this.application().companyName;
        if (!companyName) return null;
        // Sanitize company name for URL
        const sanitized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://logo.clearbit.com/${sanitized}.com`;
    });

    // Computed: Days since last activity
    daysSinceUpdate = computed(() => {
        const app = this.application();
        const lastDate = new Date(app.appliedAt); // Use appliedAt as proxy for lastUpdated
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    // Computed: Is application stale (>14 days, status is Applied or Interviewing)
    isStale = computed(() => {
        const app = this.application();
        const staleStatuses = [JobApplicationStatus.Applied, JobApplicationStatus.Interviewing];
        return staleStatuses.includes(app.status) && this.daysSinceUpdate() > 14;
    });

    // Computed: Progress percentage based on status
    progressPercent = computed(() => {
        const status = this.application().status;
        switch (status) {
            case JobApplicationStatus.Applied:
                return 25;
            case JobApplicationStatus.PhoneScreen:
            case JobApplicationStatus.TechnicalTask:
            case JobApplicationStatus.Interviewing:
                return 50;
            case JobApplicationStatus.Offer:
                return 75;
            case JobApplicationStatus.Rejected:
            case JobApplicationStatus.Ghosted:
                return 100;
            default:
                return 0;
        }
    });

    // Computed: Progress bar color
    progressColor = computed(() => {
        const status = this.application().status;
        switch (status) {
            case JobApplicationStatus.Applied:
                return 'bg-blue-500';
            case JobApplicationStatus.PhoneScreen:
            case JobApplicationStatus.TechnicalTask:
            case JobApplicationStatus.Interviewing:
                return 'bg-purple-500';
            case JobApplicationStatus.Offer:
                return 'bg-green-500';
            case JobApplicationStatus.Rejected:
            case JobApplicationStatus.Ghosted:
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    });

    // Computed: Status label
    statusLabel = computed(() => {
        const status = this.application().status;
        switch (status) {
            case JobApplicationStatus.Applied:
                return 'Applied';
            case JobApplicationStatus.PhoneScreen:
                return 'Phone Screen';
            case JobApplicationStatus.TechnicalTask:
                return 'Technical Task';
            case JobApplicationStatus.Interviewing:
                return 'Interviewing';
            case JobApplicationStatus.Offer:
                return 'Offer';
            case JobApplicationStatus.Rejected:
                return 'Rejected';
            case JobApplicationStatus.Ghosted:
                return 'Ghosted';
            default:
                return 'Unknown';
        }
    });

    // Format date
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    // Handle logo error
    onLogoError(): void {
        this.logoFailed.set(true);
    }

    // Click handlers
    onCardClick(): void {
        this.openWorkstation.emit(this.application().id);
    }

    onJobUrlClick(event: Event): void {
        event.stopPropagation();
        const url = this.application().jobUrl;
        if (url) {
            this.openJobUrl.emit(url);
        }
    }
}
