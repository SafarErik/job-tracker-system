import {
    Component,
    input,
    computed,
    output,
    ChangeDetectionStrategy,
    signal,
} from '@angular/core';
import { HlmCard } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { BrnTooltipImports } from '@spartan-ng/brain/tooltip';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobType } from '../../models/job-type.enum';
import { WorkplaceType } from '../../models/workplace-type.enum';
import { JobPriority } from '../../models/job-priority.enum';
import { LogoPlaceholderComponent } from '../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { SalaryFormatterPipe } from '../../pipes/salary-formatter.pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideZap,
    lucideTimer,
    lucideCircle,
    lucideSparkles,
    lucideArchive,
    lucideSend,
    lucideCheckCircle2,
    lucideClock,
    lucideFlame,
    lucideStar,
} from '@ng-icons/lucide';

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
        ...HlmButtonImports,
        ...HlmTooltipImports,
        ...BrnTooltipImports,
        LogoPlaceholderComponent,
        SalaryFormatterPipe,
        NgIcon,
    ],
    providers: [
        provideIcons({
            lucideZap,
            lucideTimer,
            lucideCircle,
            lucideSparkles,
            lucideArchive,
            lucideSend,
            lucideCheckCircle2,
            lucideClock,
            lucideFlame,
            lucideStar,
        }),
    ],
    templateUrl: './application-card.component.html',
    styleUrl: './application-card.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardComponent {
    // Inputs
    application = input.required<JobApplication>();
    compact = input<boolean>(false); // Compact mode for Kanban boards

    // Outputs
    openWorkstation = output<string>();
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

    // Computed: Is Interviewing (for pulse effect)
    isInterviewing = computed(() =>
        [
            JobApplicationStatus.PhoneScreen,
            JobApplicationStatus.TechnicalTask,
            JobApplicationStatus.Interviewing,
        ].includes(this.application().status),
    );

    // Computed: Is Offer (for glow effect)
    isOfferReceived = computed(() =>
        this.application().status === JobApplicationStatus.Offer
    );

    // Computed: Is overdue
    isOverdue = computed(() => {
        const nextDate = this.application().nextFollowUpDate;
        if (!nextDate) return false;
        return new Date(nextDate) < new Date();
    });

    // Computed: Dynamic Container Classes
    containerClasses = computed(() => {
        const base =
            'group relative w-full flex flex-col cursor-pointer bg-card rounded-2xl border transition-all duration-300 ease-out shadow-sm';

        const score = this.application().matchScore || 0;
        let borderColor = 'border-border/50';

        if (score >= 80) borderColor = 'border-emerald-500/40';
        else if (score >= 50) borderColor = 'border-amber-500/40';
        else borderColor = 'border-slate-500/20';

        if (this.isDead()) {
            return `${base} ${borderColor} opacity-60 grayscale hover:opacity-100 hover:grayscale-0 shadow-none`;
        }

        if (this.isOffer()) {
            return `${base} border-success/30 shadow-lg shadow-success/10 hover:-translate-y-1.5 hover:shadow-2xl hover:border-success/50`;
        }

        if (this.isOverdue()) {
            return `${base} border-warning/40 hover:-translate-y-1.5 hover:shadow-2xl`;
        }

        // Standard Card: Premium Primary Gradient Border effect
        return `${base} ${borderColor} hover:border-primary/50 hover:-translate-y-1.5 hover:shadow-xl`;
    });

    // Computed: Status Strip Color (The Left Border)
    statusStripColor = computed(() => {
        if (this.isOffer()) return 'bg-success';
        if (this.isDead()) return 'bg-muted-foreground/30';
        if (this.isOverdue()) return 'bg-warning';
        return 'bg-primary';
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
                return 'bg-info';
            case JobApplicationStatus.PhoneScreen:
                return 'bg-info/80';
            case JobApplicationStatus.TechnicalTask:
                return 'bg-warning/80';
            case JobApplicationStatus.Interviewing:
                return 'bg-primary';
            case JobApplicationStatus.Offer:
                return 'bg-success';
            case JobApplicationStatus.Accepted:
                return 'bg-success';
            case JobApplicationStatus.Rejected:
                return 'bg-destructive';
            case JobApplicationStatus.Ghosted:
                return 'bg-muted-foreground';
            default:
                return 'bg-muted-foreground/30';
        }
    });

    // Computed: Status dot class for visual indicator
    statusDotClass = computed(() => {
        const status = this.application().status;
        switch (status) {
            case JobApplicationStatus.Applied:
                return 'bg-info';
            case JobApplicationStatus.PhoneScreen:
                return 'bg-info/80';
            case JobApplicationStatus.TechnicalTask:
                return 'bg-warning/80';
            case JobApplicationStatus.Interviewing:
                return 'bg-primary';
            case JobApplicationStatus.Offer:
                return 'bg-success';
            case JobApplicationStatus.Accepted:
                return 'bg-success';
            case JobApplicationStatus.Rejected:
                return 'bg-destructive';
            case JobApplicationStatus.Ghosted:
                return 'bg-muted-foreground';
            default:
                return 'bg-muted-foreground/30';
        }
    });

    /**
     * Get consistent tailwind classes for status badges
     */
    getStatusClasses(status: JobApplicationStatus): string {
        const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border';

        switch (status) {
            case JobApplicationStatus.Applied:
                return `${base} bg-primary/10 text-primary border-primary/20`;

            case JobApplicationStatus.PhoneScreen:
            case JobApplicationStatus.TechnicalTask:
            case JobApplicationStatus.Interviewing:
                return `${base} bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse`;

            case JobApplicationStatus.Offer:
                return `${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]`;

            case JobApplicationStatus.Accepted:
                return `${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`;

            case JobApplicationStatus.Rejected:
            case JobApplicationStatus.Ghosted:
                return `${base} bg-destructive/10 text-destructive border-destructive/20`;

            default:
                return `${base} bg-muted/10 text-muted-foreground border-muted/20`;
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
                return 'bg-destructive/10 text-destructive border-destructive/20';
            case JobPriority.Medium:
                return 'bg-warning/10 text-warning border-warning/20';
            case JobPriority.Low:
                return 'bg-info/10 text-info border-info/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    });

    // Computed: Match Score Color
    matchScoreColorClasses = computed(() => {
        const score = this.application().matchScore || 0;
        const isDead = this.isDead();

        if (isDead) {
            return 'bg-muted-foreground/10 text-muted-foreground/50 border-muted-foreground/20 opacity-50 saturate-0 line-through';
        }

        if (score >= 80) return 'bg-success/10 text-success border-success/20';
        if (score >= 50) return 'bg-info/10 text-info border-info/20';
        return 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20';
    });

    // Computed: Smart Action logic
    smartAction = computed(() => {
        const app = this.application();
        const status = app.status;

        // Interviewing statuses
        if ([
            JobApplicationStatus.PhoneScreen,
            JobApplicationStatus.TechnicalTask,
            JobApplicationStatus.Interviewing
        ].includes(status)) {
            return {
                text: 'Prepare for Interview',
                color: 'text-indigo-400',
                icon: 'lucideZap'
            };
        }

        // Offer statuses
        if (status === JobApplicationStatus.Offer) {
            return {
                text: 'Review Offer Details',
                color: 'text-emerald-400 font-bold',
                icon: 'lucideCheckCircle2'
            };
        }

        // Applied status with follow-up logic
        if (status === JobApplicationStatus.Applied) {
            const lastUpdated = app.updatedAt || app.appliedAt;
            const updatedAt = new Date(lastUpdated);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                return {
                    text: 'Follow-up Recommended',
                    color: 'text-amber-400',
                    icon: 'lucideTimer'
                };
            }
            return {
                text: 'Awaiting Response',
                color: 'text-slate-500',
                icon: 'lucideClock'
            };
        }

        // Rejected
        if (status === JobApplicationStatus.Rejected) {
            return {
                text: 'Archive Application',
                color: 'text-red-400',
                icon: 'lucideArchive'
            };
        }

        // Ghosted
        if (status === JobApplicationStatus.Ghosted) {
            return {
                text: 'Send Nudge',
                color: 'text-orange-400',
                icon: 'lucideSend'
            };
        }

        return {
            text: 'Keep tracking',
            color: 'text-slate-500',
            icon: 'lucideCircle'
        };
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
