import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideBarChart3,
  lucideBriefcase,
  lucideCheckCircle2,
  lucideFileText,
  lucideListChecks,
  lucideTrendingUp,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { JobApplication } from '../../../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../../../job-applications/models/application-status.enum';
import { JobApplicationStore } from '../../../job-applications/services/job-application.store';
import { CompanyStore } from '../../../companies/services/company.store';

interface ProgressStage {
  label: string;
  count: number;
  helper: string;
  width: number;
  tone: 'primary' | 'success' | 'warning' | 'muted';
}

interface InsightMetric {
  label: string;
  value: string;
  body: string;
  tone: 'primary' | 'success' | 'warning' | 'muted';
}

interface RecommendedMove {
  title: string;
  body: string;
  cta: string;
  route?: string;
}

@Component({
  selector: 'app-tactical-analytics',
  imports: [CommonModule, RouterLink, NgIcon, ...HlmButtonImports, ...HlmSkeletonImports],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideBarChart3,
      lucideBriefcase,
      lucideCheckCircle2,
      lucideFileText,
      lucideListChecks,
      lucideTrendingUp,
    }),
  ],
  templateUrl: './tactical-analytics.component.html',
  styleUrls: ['./tactical-analytics.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TacticalAnalyticsComponent implements OnInit {
  private readonly applicationStore = inject(JobApplicationStore);
  private readonly companyStore = inject(CompanyStore);

  readonly applications = this.applicationStore.applications;
  readonly companies = this.companyStore.companies;
  readonly isLoading = computed(
    () => this.applicationStore.isLoading() || this.companyStore.isLoading(),
  );

  readonly totalApplications = computed(() => this.applications().length);
  readonly hasApplications = computed(() => this.totalApplications() > 0);

  readonly activeApplications = computed(() =>
    this.applications().filter(
      (app) =>
        app.status !== JobApplicationStatus.Rejected &&
        app.status !== JobApplicationStatus.Ghosted &&
        app.status !== JobApplicationStatus.Accepted,
    ),
  );

  readonly stageCounts = computed(() => {
    const apps = this.applications();
    return {
      applied: apps.filter((app) => app.status === JobApplicationStatus.Applied).length,
      screen: apps.filter(
        (app) =>
          app.status === JobApplicationStatus.PhoneScreen ||
          app.status === JobApplicationStatus.TechnicalTask,
      ).length,
      interview: apps.filter((app) => app.status === JobApplicationStatus.Interviewing).length,
      offer: apps.filter(
        (app) =>
          app.status === JobApplicationStatus.Offer || app.status === JobApplicationStatus.Accepted,
      ).length,
      closed: apps.filter(
        (app) =>
          app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Ghosted,
      ).length,
    };
  });

  readonly progressStages = computed<ProgressStage[]>(() => {
    const counts = this.stageCounts();
    const max = Math.max(counts.applied, counts.screen, counts.interview, counts.offer, counts.closed, 1);
    return [
      {
        label: 'Applied',
        count: counts.applied,
        helper: 'Waiting for first response or follow-up.',
        width: this.percentOf(counts.applied, max),
        tone: counts.applied > 0 ? 'primary' : 'muted',
      },
      {
        label: 'Screen',
        count: counts.screen,
        helper: 'Phone screens and technical tasks.',
        width: this.percentOf(counts.screen, max),
        tone: counts.screen > 0 ? 'primary' : 'muted',
      },
      {
        label: 'Interview',
        count: counts.interview,
        helper: 'Active interview loops.',
        width: this.percentOf(counts.interview, max),
        tone: counts.interview > 0 ? 'success' : 'muted',
      },
      {
        label: 'Offer',
        count: counts.offer,
        helper: 'Offers or accepted outcomes.',
        width: this.percentOf(counts.offer, max),
        tone: counts.offer > 0 ? 'success' : 'muted',
      },
      {
        label: 'Closed',
        count: counts.closed,
        helper: 'Rejected or ghosted applications.',
        width: this.percentOf(counts.closed, max),
        tone: counts.closed > 0 ? 'warning' : 'muted',
      },
    ];
  });

  readonly responseRate = computed(() => {
    const total = this.totalApplications();
    if (!total) return 0;
    const responded = this.applications().filter(
      (app) =>
        app.status !== JobApplicationStatus.Applied &&
        app.status !== JobApplicationStatus.Ghosted,
    ).length;
    return Math.round((responded / total) * 100);
  });

  readonly interviewRate = computed(() => {
    const total = this.totalApplications();
    if (!total) return 0;
    const interviewCount = this.stageCounts().interview + this.stageCounts().offer;
    return Math.round((interviewCount / total) * 100);
  });

  readonly documentCoverage = computed(() => {
    const total = this.totalApplications();
    if (!total) return 0;
    const ready = this.applications().filter((app) => Boolean(app.documentId)).length;
    return Math.round((ready / total) * 100);
  });

  readonly fitCoverage = computed(() => {
    const total = this.totalApplications();
    if (!total) return 0;
    const scored = this.applications().filter((app) => (app.matchScore ?? 0) > 0).length;
    return Math.round((scored / total) * 100);
  });

  readonly averageFitScore = computed(() => {
    const scored = this.applications().filter((app) => (app.matchScore ?? 0) > 0);
    if (!scored.length) return 0;
    const total = scored.reduce((sum, app) => sum + (app.matchScore ?? 0), 0);
    return Math.round(total / scored.length);
  });

  readonly insightMetrics = computed<InsightMetric[]>(() => [
    {
      label: 'Response rate',
      value: `${this.responseRate()}%`,
      body: 'Share of applications with any response beyond the initial applied state.',
      tone: this.responseRate() >= 35 ? 'success' : this.responseRate() > 0 ? 'primary' : 'muted',
    },
    {
      label: 'Interview progress',
      value: `${this.interviewRate()}%`,
      body: 'Applications that reached interview, offer, or accepted stages.',
      tone: this.interviewRate() >= 20 ? 'success' : this.interviewRate() > 0 ? 'primary' : 'muted',
    },
    {
      label: 'Document readiness',
      value: `${this.documentCoverage()}%`,
      body: 'Applications linked to a CV or supporting document.',
      tone: this.documentCoverage() >= 75 ? 'success' : this.documentCoverage() > 0 ? 'warning' : 'muted',
    },
    {
      label: 'Fit coverage',
      value: this.fitCoverage() ? `${this.fitCoverage()}%` : 'Not started',
      body: this.averageFitScore()
        ? `Average fit score is ${this.averageFitScore()}% across reviewed applications.`
        : 'Analyze fit on important applications when Vadis is configured.',
      tone: this.fitCoverage() >= 60 ? 'success' : this.fitCoverage() > 0 ? 'primary' : 'muted',
    },
  ]);

  readonly recommendedMove = computed<RecommendedMove>(() => {
    if (!this.hasApplications()) {
      return {
        title: 'Start with one real opportunity',
        body: 'Add an application, connect a company, and use the workstation to capture the role context.',
        cta: 'Open applications',
        route: '/applications',
      };
    }

    if (this.documentCoverage() < 50) {
      return {
        title: 'Improve document readiness',
        body: 'Several applications are not linked to a CV or supporting document yet.',
        cta: 'Open documents',
        route: '/documents',
      };
    }

    if (this.stageCounts().applied >= 3 && this.stageCounts().screen === 0 && this.stageCounts().interview === 0) {
      return {
        title: 'Strengthen the top of the funnel',
        body: 'You have applications waiting, but response progress is thin. Review fit and follow-up quality.',
        cta: 'Review queue',
        route: '/applications',
      };
    }

    if (this.stageCounts().interview > 0) {
      return {
        title: 'Prepare around active interviews',
        body: 'Focus your next session on role evidence, interview notes, and follow-up timing.',
        cta: 'Open applications',
        route: '/applications',
      };
    }

    return {
      title: 'Keep momentum visible',
      body: 'Your workspace has enough data to review progress weekly and decide the next focused move.',
      cta: 'Open dashboard',
      route: '/dashboard',
    };
  });

  readonly recentApplications = computed(() =>
    [...this.applications()]
      .sort((left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime())
      .slice(0, 5),
  );

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }

  getCompanyName(app: JobApplication): string {
    const company = this.companies().find((item) => item.id === app.companyId);
    return company?.name ?? app.companyName ?? 'Company not set';
  }

  getStatusLabel(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'Applied';
      case JobApplicationStatus.Interviewing:
        return 'Interview';
      case JobApplicationStatus.Rejected:
        return 'Rejected';
      case JobApplicationStatus.Offer:
        return 'Offer';
      case JobApplicationStatus.PhoneScreen:
        return 'Phone screen';
      case JobApplicationStatus.Ghosted:
        return 'Ghosted';
      case JobApplicationStatus.TechnicalTask:
        return 'Technical task';
      case JobApplicationStatus.Accepted:
        return 'Accepted';
      default:
        return 'Unknown';
    }
  }

  getMetricClass(tone: InsightMetric['tone'] | ProgressStage['tone']): string {
    return `insight-tone--${tone}`;
  }

  private percentOf(value: number, max: number): number {
    if (value === 0) return 4;
    return Math.max(8, Math.round((value / max) * 100));
  }
}
