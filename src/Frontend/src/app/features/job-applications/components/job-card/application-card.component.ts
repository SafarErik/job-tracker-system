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
import { getStatusBadgeClasses, getPriorityBadgeClasses } from '../../models/status-styles.util';
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
    lucideStar,
    lucideMapPin,
    lucideCalendar,
    lucideFlame,
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
            lucideStar,
            lucideMapPin,
            lucideCalendar,
            lucideFlame,
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
        else borderColor = 'border-muted-foreground/20';

        if (this.isDead()) {
            return `${base} ${borderColor} opacity-60 grayscale hover:opacity-100 hover:grayscale-0 shadow-none`;
        }

        if (this.isOffer()) {
            // Removed under-glow shadows, kept translation and border
            return `${base} border-success/40 hover:-translate-y-1 hover:border-success/60`;
        }

        if (this.isOverdue()) {
            // Removed under-glow shadows
            return `${base} border-warning/40 hover:-translate-y-1 hover:border-warning/60`;
        }

        // Standard Card: Removed primary shadow glow
        return `${base} ${borderColor} hover:border-primary/50 hover:-translate-y-1`;
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
        return getStatusBadgeClasses(status);
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
        return getPriorityBadgeClasses(this.application().priority);
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

    // Computed: Dynamic Insight (Modern Professional)
    dynamicInsight = computed(() => {
        const app = this.application();
        const days = this.daysSinceUpdate();
        const score = app.matchScore || 0;
        const feedback = app.aiFeedback;

        // 1. Offer
        if (this.isOffer()) {
            return { text: 'Offer Received', classes: 'text-emerald-400 font-bold', icon: 'lucideSparkles' };
        }

        // 2. Interviewing
        if (this.isInterviewing()) {
            return { text: 'Interview Stage', classes: 'text-primary font-medium', icon: 'lucideZap' };
        }

        // 3. Stale State
        if (days > 14 && !this.isDead()) {
            return { text: `No Activity (${days}d)`, classes: 'text-muted-foreground', icon: 'lucideClock' };
        }
        if (days > 7 && !this.isDead()) {
            return { text: `Follow-up Due`, classes: 'text-amber-400', icon: 'lucideTimer' };
        }

        // 4. High Match
        if (score >= 90) {
            return { text: 'Strong Profile Match', classes: 'text-emerald-400', icon: 'lucideStar' };
        }

        // 5. AI Feedback Snippet
        if (feedback) {
            const firstSentence = feedback.split(/[.!?]/)[0];
            const snippet = firstSentence.length > 35 ? firstSentence.substring(0, 32) + '...' : firstSentence;
            return { text: `Analysis: ${snippet}`, classes: 'text-sky-400', icon: 'lucideZap' };
        }

        return { text: 'Application Sent', classes: 'text-muted-foreground', icon: 'lucideCheckCircle2' };
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
                color: 'text-primary',
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
                color: 'text-muted-foreground',
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
