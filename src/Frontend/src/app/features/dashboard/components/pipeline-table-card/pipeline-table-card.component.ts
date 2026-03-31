import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import {
  PipelineChartComponent,
  PipelineStage,
} from '../pipeline-chart/pipeline-chart.component';
import { JobApplication } from '../../../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../../../job-applications/models/application-status.enum';

@Component({
  selector: 'app-pipeline-table-card',
  imports: [
    CommonModule,
    PipelineChartComponent,
    ...HlmSkeletonImports,
    ...HlmSeparatorImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pipeline-table-card.component.html',
  styles: `
    :host { display: block; height: 100%; }

    .table-scroll {
      max-height: 320px;
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
      font-family: 'Geist Mono', 'Inter', monospace;
    }
  `,
})
export class PipelineTableCardComponent {
  readonly stages = input<PipelineStage[]>([]);
  readonly applications = input<JobApplication[]>([]);
  readonly companyMap = input<Map<string, { name: string; logoUrl?: string }>>(new Map());
  readonly loading = input(false);
  readonly showFunnel = input(true);
  readonly title = input('Recent Applications');
  readonly subtitle = input('Latest movement in your pipeline');

  readonly recentApps = computed(() =>
    [...this.applications()]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 8),
  );

  readonly skeletonRows = [1, 2, 3, 4, 5];

  getCompanyName(app: JobApplication): string {
    return this.companyMap().get(app.companyId)?.name || app.companyName || 'Unknown';
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

  getStatusBadgeClass(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Offer:
        return 'border-success/40 bg-success/10 text-success';
      case JobApplicationStatus.Interviewing:
        return 'border-primary/40 bg-primary/10 text-primary';
      case JobApplicationStatus.PhoneScreen:
      case JobApplicationStatus.TechnicalTask:
        return 'border-info/40 bg-info/10 text-info';
      case JobApplicationStatus.Rejected:
      case JobApplicationStatus.Ghosted:
        return 'border-destructive/40 bg-destructive/10 text-destructive';
      case JobApplicationStatus.Applied:
      default:
        return 'border-border bg-muted/70 text-foreground';
    }
  }

  getStatusLabel(status: JobApplicationStatus): string {
    return JobApplicationStatus[status].replaceAll(/([A-Z])/g, ' $1').trim();
  }

  trackByApp(_: number, app: JobApplication): string {
    return app.id;
  }
}
