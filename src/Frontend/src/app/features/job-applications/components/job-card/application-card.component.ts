import {
    Component,
    input,
    computed,
    output,
    ChangeDetectionStrategy,
    signal,
    inject,
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../../core/services';

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
        NgIcon,
        TranslocoPipe,
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
    private readonly languageService = inject(LanguageService);
    private readonly transloco = inject(TranslocoService);

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
        const lastDate = new Date(app.appliedAt);
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

    // Computed: Dynamic Container Classes
    containerClasses = computed(() => {
        const base =
            'group relative w-full flex flex-col cursor-pointer bg-card rounded-lg border transition-all duration-300 ease-out shadow-sm';

        const score = this.application().matchScore || 0;
        let borderColor = 'border-border/50';

        if (score >= 80) borderColor = 'border-emerald-500/40';
        else if (score >= 50) borderColor = 'border-amber-500/40';
        else borderColor = 'border-muted-foreground/20';

        if (this.isDead()) {
            return `${base} ${borderColor} opacity-60 grayscale hover:opacity-100 hover:grayscale-0 shadow-none`;
        }

        if (this.isOffer()) {
            return `${base} border-success/40 hover:-translate-y-1 hover:border-success/60`;
        }

        // Standard Card: Removed primary shadow glow
        return `${base} ${borderColor} hover:border-primary/50 hover:-translate-y-1`;
    });

    // Computed: Status Strip Color (The Left Border)
    statusStripColor = computed(() => {
        if (this.isOffer()) return 'bg-success';
        if (this.isDead()) return 'bg-muted-foreground/30';
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
        const statusName = JobApplicationStatus[status] ?? 'Applied';
        return this.t(`dashboard.workQueue.status.${statusName}`);
    });



    // Computed: Job Type Label
    jobTypeLabel = computed(() => {
        const type = this.application().jobType;
        switch (type) {
            case JobType.FullTime:
                return this.t('applications.card.jobType.fullTime');
            case JobType.PartTime:
                return this.t('applications.card.jobType.partTime');
            case JobType.Internship:
                return this.t('applications.card.jobType.internship');
            case JobType.Contract:
                return this.t('applications.card.jobType.contract');
            case JobType.Freelance:
                return this.t('applications.card.jobType.freelance');
            default:
                return this.t('common.states.unknown');
        }
    });

    // Computed: Workplace Type Label
    workplaceTypeLabel = computed(() => {
        const type = this.application().workplaceType;
        switch (type) {
            case WorkplaceType.OnSite:
                return this.t('applications.card.workplace.onSite');
            case WorkplaceType.Remote:
                return this.t('applications.card.workplace.remote');
            case WorkplaceType.Hybrid:
                return this.t('applications.card.workplace.hybrid');
            default:
                return this.t('common.states.unknown');
        }
    });

    // Computed: Priority Label
    priorityLabel = computed(() => {
        const priority = this.application().priority;
        switch (priority) {
            case JobPriority.High:
                return this.t('dashboard.workQueue.priority.high');
            case JobPriority.Medium:
                return this.t('dashboard.workQueue.priority.medium');
            case JobPriority.Low:
                return this.t('dashboard.workQueue.priority.low');
            default:
                return this.t('dashboard.workQueue.priority.medium');
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
            return { text: this.t('applications.card.insights.offer'), classes: 'text-emerald-400 font-bold', icon: 'lucideSparkles' };
        }

        // 2. Interviewing
        if (this.isInterviewing()) {
            return { text: this.t('applications.card.insights.interview'), classes: 'text-primary font-medium', icon: 'lucideZap' };
        }

        // 3. Stale State
        if (days > 14 && !this.isDead()) {
            return { text: this.t('applications.card.insights.noActivity', { days }), classes: 'text-muted-foreground', icon: 'lucideClock' };
        }
        if (days > 7 && !this.isDead()) {
            return { text: this.t('applications.card.insights.followUpDue'), classes: 'text-amber-400', icon: 'lucideTimer' };
        }

        // 4. High Match
        if (score >= 90) {
            return { text: this.t('applications.card.insights.strongFit'), classes: 'text-emerald-400', icon: 'lucideStar' };
        }

        // 5. Vadis feedback snippet
        if (feedback) {
            const firstSentence = feedback.split(/[.!?]/)[0];
            const snippet = firstSentence.length > 35 ? firstSentence.substring(0, 32) + '...' : firstSentence;
            return { text: this.t('applications.card.insights.analysis', { snippet }), classes: 'text-sky-400', icon: 'lucideZap' };
        }

        return { text: this.t('applications.card.insights.sent'), classes: 'text-muted-foreground', icon: 'lucideCheckCircle2' };
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
                text: this.t('applications.nextActions.practiceForScreen'),
                color: 'text-primary',
                icon: 'lucideZap'
            };
        }

        // Offer statuses
        if (status === JobApplicationStatus.Offer) {
            return {
                text: this.t('applications.nextActions.prepareResponse'),
                color: 'text-emerald-400 font-bold',
                icon: 'lucideCheckCircle2'
            };
        }

        // Applied status with follow-up logic
        if (status === JobApplicationStatus.Applied) {
            const updatedAt = new Date(app.appliedAt);
            const now = new Date();
            const diffDays = Math.ceil(Math.abs(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays > 7) {
                return {
                    text: this.t('applications.nextActions.followUp'),
                    color: 'text-amber-400',
                    icon: 'lucideTimer'
                };
            }
            return {
                text: this.t('applications.nextActions.reviewFit'),
                color: 'text-muted-foreground',
                icon: 'lucideClock'
            };
        }

        // Rejected
        if (status === JobApplicationStatus.Rejected) {
            return {
                text: this.t('applications.nextActions.archive'),
                color: 'text-red-400',
                icon: 'lucideArchive'
            };
        }

        // Ghosted
        if (status === JobApplicationStatus.Ghosted) {
            return {
                text: this.t('applications.nextActions.reengage'),
                color: 'text-orange-400',
                icon: 'lucideSend'
            };
        }

        return {
            text: this.t('applications.nextActions.reviewFit'),
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

    private t(key: string, params?: Record<string, unknown>): string {
        this.languageService.locale();
        return this.transloco.translate(key, params);
    }


}
