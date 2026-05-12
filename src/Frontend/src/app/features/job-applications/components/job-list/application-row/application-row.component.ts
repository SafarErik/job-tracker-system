import { Component, input, output, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../../models/job-application.model';
import { JobApplicationStatus } from '../../../models/application-status.enum';
import { getStatusStyle } from '../../../models/status-styles.util';
import { LogoPlaceholderComponent } from '../../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideZap,
  lucideTimer,
  lucideCircle,
  lucideSend,
  lucideCheckCircle2,
  lucideClock,
  lucideExternalLink,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { BrnTooltipImports } from '@spartan-ng/brain/tooltip';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../../../core/services';

@Component({
  selector: 'tr[app-application-row]',
  imports: [
    CommonModule,
    LogoPlaceholderComponent,
    NgIcon,
    ...HlmButtonImports,
    ...HlmTooltipImports,
    ...BrnTooltipImports,
    TranslocoPipe,
  ],
  providers: [
    provideIcons({
      lucideArchive,
      lucideZap,
      lucideTimer,
      lucideCircle,
      lucideSend,
      lucideCheckCircle2,
      lucideClock,
      lucideExternalLink,
    }),
  ],
  templateUrl: './application-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'group cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/30',
    '(click)': 'onRowClick()',
  },
})
export class ApplicationRowComponent {
  application = input.required<JobApplication>();
  private readonly languageService = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);

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
    return this.getStatusLabel(this.application().status);
  });

  // Computed: Status Text Color (classes)
  statusTextClass = computed(() => {
    return getStatusStyle(this.application().status).columnText;
  });

  // Computed: Pipeline depth for progress bar
  statusDepth = computed(() => {
    switch (this.application().status) {
      case JobApplicationStatus.Applied:
        return 1;
      case JobApplicationStatus.PhoneScreen:
        return 2;
      case JobApplicationStatus.TechnicalTask:
        return 3;
      case JobApplicationStatus.Interviewing:
        return 4;
      case JobApplicationStatus.Offer:
      case JobApplicationStatus.Accepted:
        return 5;
      default:
        return 0;
    }
  });

  // Computed: Match Score Classes
  matchScoreClasses = computed(() => {
    const status = this.application().status;
    const isDead =
      status === JobApplicationStatus.Rejected || status === JobApplicationStatus.Ghosted;

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

    if (
      [
        JobApplicationStatus.PhoneScreen,
        JobApplicationStatus.TechnicalTask,
        JobApplicationStatus.Interviewing,
      ].includes(status)
    ) {
      return {
        textKey: 'applications.nextActions.practiceForScreen',
        color: 'text-primary',
        icon: 'lucideZap',
      };
    }

    if (status === JobApplicationStatus.Offer) {
      return {
        textKey: 'applications.nextActions.prepareResponse',
        color: 'text-emerald-400 font-bold',
        icon: 'lucideCheckCircle2',
      };
    }

    if (status === JobApplicationStatus.Applied) {
      const updatedAt = new Date(app.appliedAt);
      const now = new Date();
      const diffDays = Math.ceil(
        Math.abs(now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays > 7) {
        return {
          textKey: 'applications.nextActions.followUp',
          color: 'text-amber-400',
          icon: 'lucideTimer',
        };
      }
      return {
        textKey: 'applications.nextActions.reviewFit',
        color: 'text-muted-foreground',
        icon: 'lucideClock',
      };
    }

    if (status === JobApplicationStatus.Rejected) {
      return {
        textKey: 'applications.nextActions.archive',
        color: 'text-red-400',
        icon: 'lucideArchive',
      };
    }

    if (status === JobApplicationStatus.Ghosted) {
      return {
        textKey: 'applications.nextActions.reengage',
        color: 'text-orange-400',
        icon: 'lucideSend',
      };
    }

    return {
      textKey: 'applications.nextActions.reviewFit',
      color: 'text-muted-foreground',
      icon: 'lucideCircle',
    };
  });

  // Computed: Last Activity text
  lastActivity = computed(() => {
    const lastDate = this.application().appliedAt;
    const updatedAt = new Date(lastDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updatedAt.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return this.t('common.time.today');
    if (diffDays === 1) return this.t('common.time.dayAgo');
    return this.t('common.time.daysAgo', { count: diffDays });
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

  private getStatusLabel(status: JobApplicationStatus): string {
    const statusName = JobApplicationStatus[status] ?? 'Applied';
    return this.t(`dashboard.workQueue.status.${statusName}`, undefined, getStatusStyle(status).label);
  }

  private t(key: string, params?: Record<string, unknown>, fallback?: string): string {
    this.languageService.locale();
    return this.transloco.translate(key, params) || fallback || key;
  }
}
