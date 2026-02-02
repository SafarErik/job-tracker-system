import { Component, input, output, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { SalaryFormatterPipe } from '../../pipes/salary-formatter.pipe';
import { getStatusStyle, getStatusStyles } from '../../models/status-styles.util';
import { LogoPlaceholderComponent } from '../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideMoreHorizontal, lucideArrowRight, lucideZap, lucideTimer, lucideCircle, lucideSparkles, lucideSend, lucideCheckCircle2, lucideClock, lucideExternalLink } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { BrnTooltipImports } from '@spartan-ng/brain/tooltip';

@Component({
    selector: 'tr[app-application-row]',
    standalone: true,
    imports: [
        CommonModule,
        SalaryFormatterPipe,
        LogoPlaceholderComponent,
        NgIcon,
        ...HlmButtonImports,
        ...HlmTooltipImports,
        ...BrnTooltipImports,
    ],
    providers: [provideIcons({ lucideArchive, lucideMoreHorizontal, lucideArrowRight, lucideZap, lucideTimer, lucideCircle, lucideSparkles, lucideSend, lucideCheckCircle2, lucideClock, lucideExternalLink })],
    templateUrl: './application-row.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'group border-b border-border/30 hover:bg-secondary/10 transition-colors cursor-pointer',
        '(click)': 'onRowClick()'
    }
})
export class ApplicationRowComponent {
    application = input.required<JobApplication>();

    viewDetail = output<string>();
    archive = output<string>();
    moveStatus = output<string>();

    onRowClick(): void {
        this.viewDetail.emit(this.application().id);
    }

    onArchive(event: Event): void {
        event.stopPropagation();
        this.archive.emit(this.application().id);
    }

    onViewDetail(event: Event): void {
        event.stopPropagation();
        this.viewDetail.emit(this.application().id);
    }

    // Computed: Status label
    statusLabel = computed(() => {
        return getStatusStyle(this.application().status).label;
    });

    // Computed: Status Text Color (classes)
    statusTextClass = computed(() => {
        return getStatusStyle(this.application().status).columnText;
    });

    // Computed: Pipeline depth for progress bar
    statusDepth = computed(() => {
        switch (this.application().status) {
            case JobApplicationStatus.Applied: return 1;
            case JobApplicationStatus.PhoneScreen: return 2;
            case JobApplicationStatus.TechnicalTask: return 3;
            case JobApplicationStatus.Interviewing: return 4;
            case JobApplicationStatus.Offer:
            case JobApplicationStatus.Accepted: return 5;
            default: return 0;
        }
    });

    // Computed: Match Score Classes
    matchScoreClasses = computed(() => {
        const status = this.application().status;
        const isDead = status === JobApplicationStatus.Rejected || status === JobApplicationStatus.Ghosted;

        if (isDead) {
            return 'text-muted-foreground/50 line-through grayscale opacity-50';
        }

        const score = this.application().matchScore || 0;
        if (score >= 80) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-muted-foreground';
    });

    // Computed: Smart Action logic
    smartAction = computed(() => {
        const app = this.application();
        const status = app.status;

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

        if (status === JobApplicationStatus.Offer) {
            return {
                text: 'Review Offer Details',
                color: 'text-emerald-400 font-bold',
                icon: 'lucideCheckCircle2'
            };
        }

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

        if (status === JobApplicationStatus.Rejected) {
            return {
                text: 'Archive Application',
                color: 'text-red-400',
                icon: 'lucideArchive'
            };
        }

        if (status === JobApplicationStatus.Ghosted) {
            return {
                text: 'Send Nudge',
                color: 'text-orange-400',
                icon: 'lucideSend'
            };
        }

        return {
            text: 'Keep tracking',
            color: 'text-muted-foreground',
            icon: 'lucideCircle'
        };
    });

    // Computed: Last Activity text
    lastActivity = computed(() => {
        const appliedDate = new Date(this.application().appliedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - appliedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays} days ago`;
    });

    // Computed: Logo URL
    logoUrl = computed(() => {
        const companyName = this.application().companyName;
        if (!companyName) return null;
        const sanitized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://logo.clearbit.com/${sanitized}.com`;
    });

    getStepClass(step: number): string {
        const depth = this.statusDepth();
        const status = this.application().status;

        if (step <= depth) {
            // Map status to its semantic color for the progress bar
            const style = getStatusStyle(status);
            // Extract the color name from the columnText (e.g., 'text-emerald-500' -> 'bg-emerald-500')
            const colorClass = style.columnText.replace('text-', 'bg-');
            return colorClass;
        }
        return 'bg-secondary';
    }
}
