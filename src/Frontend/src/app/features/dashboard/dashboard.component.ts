import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Globe, LucideAngularModule, LucideIconProvider, LUCIDE_ICONS } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { Company } from '../companies/models/company.model';
import { JobApplication } from '../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../job-applications/models/application-status.enum';
import { JobApplicationStore } from '../job-applications/services/job-application.store';
import { CompanyStore } from '../companies/services/company.store';
import { MetricCardComponent } from './components/metric-card/metric-card.component';
import {
  AiCommandWidgetComponent,
  AiInsightCard,
} from './components/ai-command-widget/ai-command-widget.component';
import {
  PipelineChartComponent,
  PipelineStage,
} from './components/pipeline-chart/pipeline-chart.component';

interface LocationPoint {
  id: string;
  label: string;
  detail: string;
  x: number;
  y: number;
  kind: 'application' | 'opportunity';
  count: number;
}

const FALLBACK_WORLD_POINT = { x: 51, y: 52 };

const LOCATION_COORDINATES: Record<string, { x: number; y: number }> = {
  london: { x: 47, y: 34 },
  uk: { x: 47, y: 33 },
  'united kingdom': { x: 47, y: 33 },
  berlin: { x: 52, y: 34 },
  paris: { x: 49, y: 35 },
  madrid: { x: 47, y: 39 },
  amsterdam: { x: 50, y: 33 },
  dublin: { x: 45, y: 33 },
  'new york': { x: 26, y: 35 },
  boston: { x: 28, y: 33 },
  chicago: { x: 23, y: 36 },
  seattle: { x: 17, y: 30 },
  'san francisco': { x: 13, y: 38 },
  california: { x: 14, y: 39 },
  toronto: { x: 24, y: 31 },
  remote: { x: 56, y: 26 },
  eu: { x: 52, y: 34 },
  europe: { x: 52, y: 34 },
  dubai: { x: 63, y: 42 },
  singapore: { x: 77, y: 56 },
  tokyo: { x: 86, y: 38 },
  sydney: { x: 88, y: 74 },
};

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    LucideAngularModule,
    MetricCardComponent,
    PipelineChartComponent,
    AiCommandWidgetComponent,
  ],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Globe,
      }),
    },
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly applicationStore = inject(JobApplicationStore);
  private readonly companyStore = inject(CompanyStore);
  private readonly authService = inject(AuthService);

  readonly now = signal(new Date());

  readonly applications = this.applicationStore.applications;
  readonly companies = this.companyStore.companies;
  readonly metrics = this.applicationStore.metrics;

  readonly greetingPeriod = computed(() => {
    const hour = this.now().getHours();
    if (hour < 12) {
      return 'Morning';
    }

    if (hour < 18) {
      return 'Afternoon';
    }

    return 'Evening';
  });

  readonly userName = computed(() => {
    const user = this.authService.user();
    if (!user) {
      return 'Operator';
    }

    const firstName = user.firstName?.trim();
    if (firstName) {
      return firstName;
    }

    return user.email?.split('@')[0] || 'Operator';
  });

  readonly currentDateLabel = computed(() =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(this.now()),
  );

  readonly totalApplications = computed(() => this.metrics().total);

  readonly activePipeline = computed(
    () =>
      this.applications().filter((app) => app.status === JobApplicationStatus.Interviewing).length,
  );

  readonly offersCount = computed(() => this.metrics().offers);

  readonly dueFollowUps = computed(
    () =>
      this.applications().filter(
        (app) =>
          app.status === JobApplicationStatus.Applied ||
          app.status === JobApplicationStatus.PhoneScreen,
      ).length,
  );

  readonly successRate = computed(() => {
    const total = this.totalApplications();
    if (total === 0) {
      return 0;
    }

    return Math.round((this.offersCount() / total) * 100);
  });

  readonly nextAction = computed(() => {
    const interviews = this.activePipeline();
    if (interviews > 0) {
      return 'Interview in 2h';
    }

    const count = this.dueFollowUps() > 0 ? this.dueFollowUps() : 3;
    return `${count} Follow-ups due`;
  });

  readonly copilotContext = computed(() => {
    const latest = [...this.applications()]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .at(0);

    return {
      totalApplications: this.totalApplications(),
      activePipeline: this.activePipeline(),
      offers: this.offersCount(),
      dueFollowUps: this.dueFollowUps(),
      topCompany: latest ? this.getCompanyName(latest) : undefined,
    };
  });

  readonly insightCards = computed<AiInsightCard[]>(() => {
    const cards: AiInsightCard[] = [];
    const dueFollowUps = this.dueFollowUps();
    const activePipeline = this.activePipeline();
    const successRate = this.successRate();

    if (dueFollowUps > 0) {
      cards.push({
        id: 'follow-up-sweep',
        icon: '📬',
        title: `${dueFollowUps} follow-up${dueFollowUps === 1 ? '' : 's'} pending`,
        action: 'Run',
        command: 'follow-ups',
      });
    }

    if (activePipeline > 0) {
      cards.push({
        id: 'interview-prep',
        icon: '🧠',
        title: `Prep pack for ${activePipeline} active interview flow${activePipeline === 1 ? '' : 's'}`,
        action: 'Launch',
        command: 'interview prep',
      });
    }

    if (successRate < 20 && this.totalApplications() >= 5) {
      cards.push({
        id: 'conversion-check',
        icon: '⚠️',
        title: 'Conversion rate below target',
        action: 'Fix',
        command: 'offer strategy',
      });
    }

    if (cards.length < 3) {
      cards.push({
        id: 'pipeline-snapshot',
        icon: '📊',
        title: 'Pipeline snapshot available',
        action: 'Open',
        command: 'summary',
      });
    }

    if (cards.length < 3) {
      cards.push({
        id: 'priority-action',
        icon: '🎯',
        title: "Generate today's next action",
        action: 'Run',
        command: 'next action',
      });
    }

    return cards.slice(0, 3);
  });

  readonly sparklinePoints = computed(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const daily = Array.from({ length: 7 }, () => 0);

    for (const app of this.applications()) {
      const appliedAt = new Date(app.appliedAt);
      const dayDelta = Math.floor(
        (startOfToday.getTime() - new Date(appliedAt.setHours(0, 0, 0, 0)).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (dayDelta >= 0 && dayDelta < 7) {
        daily[6 - dayDelta] += 1;
      }
    }

    const max = Math.max(...daily, 1);
    const width = 220;
    const height = 56;

    return daily
      .map((value, index) => {
        const x = (index / (daily.length - 1)) * width;
        const y = height - (value / max) * (height - 8);
        return `${x},${y}`;
      })
      .join(' ');
  });

  readonly funnelStages = computed<PipelineStage[]>(() => {
    const apps = this.applications();

    return [
      {
        label: 'Applied',
        count: apps.filter((app) => app.status === JobApplicationStatus.Applied).length,
      },
      {
        label: 'Screen',
        count: apps.filter(
          (app) =>
            app.status === JobApplicationStatus.PhoneScreen ||
            app.status === JobApplicationStatus.TechnicalTask,
        ).length,
      },
      {
        label: 'Interview',
        count: apps.filter((app) => app.status === JobApplicationStatus.Interviewing).length,
      },
      {
        label: 'Offer',
        count: apps.filter((app) => app.status === JobApplicationStatus.Offer).length,
      },
    ];
  });

  readonly recentApplications = computed(() =>
    [...this.applications()]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 9),
  );

  readonly companyById = computed(
    () => new Map(this.companies().map((company) => [company.id, company])),
  );

  readonly mapPoints = computed<LocationPoint[]>(() => {
    const appPoints = this.buildApplicationPoints(this.applications(), this.companies());
    const opportunityPoints = this.buildOpportunityPoints();

    return [...appPoints, ...opportunityPoints].slice(0, 12);
  });

  readonly totalTrackedLocations = computed(() => this.mapPoints().length);

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }

  trackByLocation(_: number, point: LocationPoint): string {
    return point.id;
  }

  trackByApplication(_: number, app: JobApplication): string {
    return app.id;
  }

  getCompanyName(app: JobApplication): string {
    return this.companyById().get(app.companyId)?.name || app.companyName || 'Unknown Company';
  }

  getCompanyLogo(app: JobApplication): string | undefined {
    return this.companyById().get(app.companyId)?.logoUrl;
  }

  getCompanyInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
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

  getProbabilityBarClass(score: number): string {
    if (score < 50) {
      return 'bg-destructive';
    }

    if (score > 80) {
      return 'bg-success';
    }

    return 'bg-primary';
  }

  getStatusLabel(status: JobApplicationStatus): string {
    return JobApplicationStatus[status].replaceAll(/([A-Z])/g, ' $1').trim();
  }

  private buildApplicationPoints(
    applications: JobApplication[],
    companies: Company[],
  ): LocationPoint[] {
    const companyById = new Map(companies.map((company) => [company.id, company]));
    const grouped = new Map<string, LocationPoint>();

    for (const application of applications) {
      const company = companyById.get(application.companyId);
      const rawLocation = company?.hqLocation || company?.address || 'Unknown';
      const coord = this.resolveLocationCoordinate(rawLocation);
      const key = `app-${rawLocation.toLowerCase()}`;

      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        grouped.set(key, { ...existing, count: existing.count + 1 });
        continue;
      }

      grouped.set(key, {
        id: key,
        label: company?.name || application.companyName || 'Tracked company',
        detail: rawLocation,
        x: coord.x,
        y: coord.y,
        kind: 'application',
        count: 1,
      });
    }

    return [...grouped.values()];
  }

  private buildOpportunityPoints(): LocationPoint[] {
    const staticLocations = [
      { id: 'nyc-opportunity', company: 'Vantage Systems', location: 'New York, USA' },
      { id: 'london-opportunity', company: 'Nebula Corp', location: 'London, UK' },
      { id: 'sf-opportunity', company: 'Cyberdyne', location: 'San Francisco, USA' },
    ];

    return staticLocations.map((opportunity, index) => {
      const coord = this.resolveLocationCoordinate(opportunity.location);

      return {
        id: opportunity.id,
        label: opportunity.company,
        detail: opportunity.location,
        x: coord.x + (index % 2 === 0 ? 0 : 1.2),
        y: coord.y + (index % 2 === 0 ? 0 : -0.8),
        kind: 'opportunity',
        count: 1,
      };
    });
  }

  private resolveLocationCoordinate(location: string): { x: number; y: number } {
    const normalized = location.toLowerCase();

    for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
      if (normalized.includes(key)) {
        return coords;
      }
    }

    return FALLBACK_WORLD_POINT;
  }
}
