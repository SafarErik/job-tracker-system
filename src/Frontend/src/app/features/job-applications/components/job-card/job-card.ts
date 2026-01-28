import {
    Component,
    input,
    computed,
    output,
    ChangeDetectionStrategy,
    signal,
} from '@angular/core';
import {
    HlmCardHeader,
    HlmCardTitle,
    HlmCardDescription,
    HlmCardContent,
    HlmCardFooter,
} from '@spartan-ng/helm/card';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobType } from '../../models/job-type.enum';
import { WorkplaceType } from '../../models/workplace-type.enum';
import { JobPriority } from '../../models/job-priority.enum';

/**
 * Job Card Component
 * Enhanced visual card for displaying job applications in grid view.
 * Features: Company logos, stale indicators, progress bars, and workstation CTA.
 */
@Component({
    selector: 'app-job-card',
    imports: [
        CommonModule,
        HlmCardHeader,
        HlmCardTitle,
        HlmCardDescription,
        HlmCardContent,
        HlmCardFooter,

        ...HlmButtonImports,
    ],
    templateUrl: './job-card.html',
    styleUrl: './job-card.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardComponent {
    // Inputs
    application = input.required<JobApplication>();
    compact = input<boolean>(false); // Compact mode for Kanban boards

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

    // Computed: Is dead (rejected/ghosted)
    isDead = computed(() =>
        [JobApplicationStatus.Rejected, JobApplicationStatus.Ghosted].includes(
            this.application().status,
        ),
    );

    // Computed: Is success (offer/accepted)
    isOffer = computed(() =>
        [JobApplicationStatus.Offer, JobApplicationStatus.Accepted].includes(
            this.application().status,
        ),
    );

    // Computed: Is application stale (>14 days, status is Applied or Interviewing)
    isStale = computed(() => {
        const app = this.application();
        const staleStatuses = [
            JobApplicationStatus.Applied,
            JobApplicationStatus.Interviewing,
            JobApplicationStatus.PhoneScreen,
            JobApplicationStatus.TechnicalTask,
        ];
        return (
            !this.isDead() &&
            !this.isOffer() &&
            staleStatuses.includes(app.status) &&
            this.daysSinceUpdate() > 14
        );
    });

    // Computed: Dynamic Container Classes
    containerClasses = computed(() => {
        const base =
            'group relative w-full flex flex-col cursor-pointer bg-card rounded-2xl border transition-all duration-300 ease-out shadow-sm';

        if (this.isDead()) {
            return `${base} border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0`;
        }

        if (this.isOffer()) {
            return `${base} border-emerald-500/30 shadow-lg shadow-emerald-500/10 hover:-translate-y-1.5 hover:shadow-2xl hover:border-emerald-500/50`;
        }

        if (this.isStale()) {
            return `${base} border-amber-500/40 hover:-translate-y-1.5 hover:shadow-2xl`;
        }

        // Standard Card: Add subtle primary border and elegant lift
        return `${base} border-primary/20 hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-xl`;
    });

    // Computed: Status Strip Color (The Left Border)
    statusStripColor = computed(() => {
        if (this.isOffer()) return 'bg-emerald-500';
        if (this.isDead()) return 'bg-slate-500/30';
        if (this.isStale()) return 'bg-amber-500';
        return 'bg-transparent';
    });

    // Computed: Progress percentage based on status
    progressPercent = computed(() => {
        const status = this.application().status;
        switch (status) {
            case JobApplicationStatus.Applied:
                return 15;
            case JobApplicationStatus.PhoneScreen:
                return 30;
            case JobApplicationStatus.TechnicalTask:
                return 45;
            case JobApplicationStatus.Interviewing:
                return 60;
            case JobApplicationStatus.Offer:
                return 80;
            case JobApplicationStatus.Accepted:
                return 100;
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
                return 'bg-blue-400';
            case JobApplicationStatus.PhoneScreen:
                return 'bg-indigo-400';
            case JobApplicationStatus.TechnicalTask:
                return 'bg-orange-400';
            case JobApplicationStatus.Interviewing:
                return 'bg-violet-400';
            case JobApplicationStatus.Offer:
                return 'bg-amber-400';
            case JobApplicationStatus.Accepted:
                return 'bg-emerald-400';
            case JobApplicationStatus.Rejected:
                return 'bg-rose-400';
            case JobApplicationStatus.Ghosted:
                return 'bg-slate-400';
            default:
                return 'bg-muted-foreground/30';
        }
    });

    // Computed: Status dot class for visual indicator
    statusDotClass = computed(() => {
        const status = this.application().status;
        switch (status) {
            case JobApplicationStatus.Applied:
                return 'bg-blue-400';
            case JobApplicationStatus.PhoneScreen:
                return 'bg-indigo-400';
            case JobApplicationStatus.TechnicalTask:
                return 'bg-orange-400';
            case JobApplicationStatus.Interviewing:
                return 'bg-violet-400';
            case JobApplicationStatus.Offer:
                return 'bg-amber-400';
            case JobApplicationStatus.Accepted:
                return 'bg-emerald-400';
            case JobApplicationStatus.Rejected:
                return 'bg-rose-400';
            case JobApplicationStatus.Ghosted:
                return 'bg-slate-400';
            default:
                return 'bg-muted-foreground/30';
        }
    });

    /**
     * Get consistent tailwind classes for status badges (Pill style)
     */
    getStatusClasses(status: JobApplicationStatus): string {
        const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent transition-all duration-300';

        switch (status) {
            case JobApplicationStatus.Applied:
                return `${base} bg-blue-500/10 text-blue-600 dark:text-blue-400`;

            case JobApplicationStatus.PhoneScreen:
                return `${base} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400`;

            case JobApplicationStatus.TechnicalTask:
                return `${base} bg-orange-500/10 text-orange-600 dark:text-orange-400`;

            case JobApplicationStatus.Interviewing:
                return `${base} bg-violet-500/10 text-violet-600 dark:text-violet-400`;

            case JobApplicationStatus.Offer:
                return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`;

            case JobApplicationStatus.Accepted:
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`;

            case JobApplicationStatus.Rejected:
                return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400`;

            case JobApplicationStatus.Ghosted:
                return `${base} bg-slate-500/10 text-slate-600 dark:text-slate-400`;

            default:
                return `${base} bg-muted text-muted-foreground`;
        }
    }

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
                return 'Offer Received';
            case JobApplicationStatus.Accepted:
                return 'Accepted';
            case JobApplicationStatus.Rejected:
                return 'Rejected';
            case JobApplicationStatus.Ghosted:
                return 'Ghosted';
            default:
                return 'Unknown';
        }
    });

    // Computed: Job Type Label
    jobTypeLabel = computed(() => {
        const type = this.application().jobType;
        switch (type) {
            case JobType.FullTime:
                return 'Full-time';
            case JobType.PartTime:
                return 'Part-time';
            case JobType.Internship:
                return 'Internship';
            case JobType.Contract:
                return 'Contract';
            case JobType.Freelance:
                return 'Freelance';
            default:
                return 'Unknown';
        }
    });

    // Computed: Workplace Type Label
    workplaceTypeLabel = computed(() => {
        const type = this.application().workplaceType;
        switch (type) {
            case WorkplaceType.OnSite:
                return 'On-site';
            case WorkplaceType.Remote:
                return 'Remote';
            case WorkplaceType.Hybrid:
                return 'Hybrid';
            default:
                return 'Unknown';
        }
    });

    // Computed: Priority Label
    priorityLabel = computed(() => {
        const priority = this.application().priority;
        switch (priority) {
            case JobPriority.High:
                return 'High Priority';
            case JobPriority.Medium:
                return 'Medium Priority';
            case JobPriority.Low:
                return 'Low Priority';
            default:
                return 'Medium';
        }
    });

    // Computed: Priority Color (Tailwind classes)
    priorityColorClasses = computed(() => {
        const priority = this.application().priority;
        switch (priority) {
            case JobPriority.High:
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            case JobPriority.Medium:
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case JobPriority.Low:
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    });

    // Computed: Match Score Color
    matchScoreColorClasses = computed(() => {
        const score = this.application().matchScore || 0;
        if (score >= 80) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
        if (score >= 50) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
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
