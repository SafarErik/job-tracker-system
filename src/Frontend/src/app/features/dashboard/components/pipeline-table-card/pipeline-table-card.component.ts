import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { LanguageService } from '../../../../core/services';
import {
  PipelineChartComponent,
  PipelineStage,
} from '../pipeline-chart/pipeline-chart.component';
import { JobApplication } from '../../../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../../../job-applications/models/application-status.enum';
import { JobPriority } from '../../../job-applications/models/job-priority.enum';
import {
  AptelionEmptyStateComponent,
  AptelionSectionHeaderComponent,
  StatusBadgeComponent,
  StatusBadgeTone,
} from '../../../../shared/components';

@Component({
  selector: 'app-pipeline-table-card',
  imports: [
    CommonModule,
    RouterLink,
    TranslocoPipe,
    PipelineChartComponent,
    AptelionEmptyStateComponent,
    AptelionSectionHeaderComponent,
    StatusBadgeComponent,
    ...HlmSkeletonImports,
    ...HlmSeparatorImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pipeline-table-card.component.html',
  styles: `
    :host { display: block; height: 100%; }

    .table-scroll {
      max-height: 420px;
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--border)) transparent;
    }

    .table-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .table-scroll::-webkit-scrollbar-thumb {
      background: hsl(var(--border));
      border-radius: 2px;
    }

    .metric-mono {
      font-family: var(--font-sans);
      font-variant-numeric: tabular-nums;
    }

    .queue-row {
      transition:
        background-color 160ms ease,
        border-color 160ms ease;
    }

    .queue-row:hover {
      background: hsl(var(--muted) / 0.42);
    }
  `,
})
export class PipelineTableCardComponent {
  private readonly languageService = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly stages = input<PipelineStage[]>([]);
  readonly applications = input<JobApplication[]>([]);
  readonly companyMap = input<Map<string, { name: string; logoUrl?: string }>>(new Map());
  readonly loading = input(false);
  readonly showFunnel = input(true);
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly addApplication = output<void>();

  readonly recentApps = computed(() => {
    return [...this.applications()]
      .sort((a, b) => {
        const urgencyDelta = this.getUrgencyScore(b) - this.getUrgencyScore(a);
        if (urgencyDelta !== 0) return urgencyDelta;
        return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
      })
      .slice(0, 8);
  });

  readonly skeletonRows = [1, 2, 3, 4, 5];

  getCompanyName(app: JobApplication): string {
    return this.companyMap().get(app.companyId)?.name || app.companyName || this.t('common.states.unknown');
  }

  getCompanyInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  getCompanyLogo(app: JobApplication): string | undefined {
    return this.companyMap().get(app.companyId)?.logoUrl;
  }

  getStatusLabel(status: JobApplicationStatus | string): string {
    const rawStatus =
      typeof status === 'number'
        ? JobApplicationStatus[status]
        : typeof status === 'string'
          ? status
        : 'Applied';

    if (typeof rawStatus !== 'string' || !rawStatus.length) {
      return this.t('dashboard.workQueue.status.Applied');
    }

    const normalized = rawStatus.replace(/([A-Z])/g, ' $1').trim();
    return this.t(`dashboard.workQueue.status.${rawStatus}`, {}, normalized);
  }

  getAgeDays(app: JobApplication): number {
    const appliedAt = new Date(app.appliedAt).getTime();
    if (Number.isNaN(appliedAt)) return 0;
    return Math.max(0, Math.floor((Date.now() - appliedAt) / 86_400_000));
  }

  getUrgencyScore(app: JobApplication): number {
    let score = 0;

    if (app.status === JobApplicationStatus.Interviewing) score += 80;
    if (app.status === JobApplicationStatus.Offer) score += 78;
    if (app.status === JobApplicationStatus.PhoneScreen || app.status === JobApplicationStatus.TechnicalTask) {
      score += 62;
    }
    if (app.status === JobApplicationStatus.Applied) score += 42;
    if (this.isStale(app)) score += 22;
    if ((app.matchScore ?? 0) >= 75) score += 14;
    if (app.priority === JobPriority.High) score += 12;

    if (app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Ghosted) {
      score -= 60;
    }

    return score;
  }

  isStale(app: JobApplication): boolean {
    return (
      this.getAgeDays(app) >= 7 &&
      (app.status === JobApplicationStatus.Applied || app.status === JobApplicationStatus.PhoneScreen)
    );
  }

  getAttentionLabel(app: JobApplication): string {
    if (app.status === JobApplicationStatus.Offer) return this.t('dashboard.workQueue.attention.decision');
    if (app.status === JobApplicationStatus.Interviewing) return this.t('dashboard.workQueue.attention.activeInterview');
    if (this.isStale(app)) return this.t('dashboard.workQueue.attention.followUp');
    if ((app.matchScore ?? 0) >= 75) return this.t('dashboard.workQueue.attention.promisingFit');
    if (app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Ghosted) {
      return this.t('dashboard.workQueue.attention.archive');
    }
    return this.t('dashboard.workQueue.attention.nextStep');
  }

  getAttentionTone(app: JobApplication): StatusBadgeTone {
    if (app.status === JobApplicationStatus.Offer) return 'warning';
    if (app.status === JobApplicationStatus.Interviewing) return 'primary';
    if (this.isStale(app)) return 'warning';
    if ((app.matchScore ?? 0) >= 75) return 'success';
    if (app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Ghosted) {
      return 'muted';
    }
    return 'muted';
  }

  getNextAction(app: JobApplication): string {
    if (app.status === JobApplicationStatus.Offer) return this.t('dashboard.workQueue.nextAction.offer');
    if (app.status === JobApplicationStatus.Interviewing) return this.t('dashboard.workQueue.nextAction.interview');
    if (app.status === JobApplicationStatus.TechnicalTask) return this.t('dashboard.workQueue.nextAction.technicalTask');
    if (app.status === JobApplicationStatus.PhoneScreen) {
      return this.isStale(app)
        ? this.t('dashboard.workQueue.nextAction.reengage')
        : this.t('dashboard.workQueue.nextAction.phoneScreen');
    }
    if (app.status === JobApplicationStatus.Applied) {
      if (!app.documentId && (app.matchScore ?? 0) >= 70) {
        return this.t('dashboard.workQueue.nextAction.updateMaterials');
      }

      return this.isStale(app)
        ? this.t('dashboard.workQueue.nextAction.followUp')
        : this.t('dashboard.workQueue.nextAction.applied');
    }
    if (app.status === JobApplicationStatus.Ghosted) {
      return this.t('dashboard.workQueue.nextAction.reengageOrArchive');
    }
    if (app.status === JobApplicationStatus.Rejected) {
      return this.t('dashboard.workQueue.nextAction.archive');
    }
    return this.t('dashboard.workQueue.nextAction.reviewNextAction');
  }

  getPriorityLabel(priority: JobPriority): string {
    if (priority === JobPriority.High) return this.t('dashboard.workQueue.priority.high');
    if (priority === JobPriority.Medium) return this.t('dashboard.workQueue.priority.medium');
    return this.t('dashboard.workQueue.priority.low');
  }

  getPriorityClass(priority: JobPriority): string {
    if (priority === JobPriority.High) return 'text-primary';
    if (priority === JobPriority.Medium) return 'text-foreground';
    return 'text-muted-foreground';
  }

  getNextActionClass(app: JobApplication): string {
    if (
      app.status === JobApplicationStatus.Offer ||
      app.status === JobApplicationStatus.Interviewing ||
      app.status === JobApplicationStatus.PhoneScreen ||
      app.status === JobApplicationStatus.TechnicalTask ||
      this.isStale(app)
    ) {
      return 'text-primary';
    }

    if (app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Ghosted) {
      return 'text-muted-foreground';
    }

    return 'text-foreground';
  }

  trackByApp(_: number, app: JobApplication): string {
    return app.id;
  }

  private t(key: string, params?: Record<string, unknown>, fallback?: string): string {
    this.languageService.locale();
    return this.transloco.translate(key, params) || fallback || key;
  }
}
