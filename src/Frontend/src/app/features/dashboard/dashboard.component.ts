import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BellDot,
  Briefcase,
  CircleQuestionMark,
  Cog,
  Globe,
  MapPin,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { Company } from '../companies/models/company.model';
import { JobApplication } from '../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../job-applications/models/application-status.enum';
import { getStatusStyles } from '../job-applications/models/status-styles.util';
import { JobApplicationStore } from '../job-applications/services/job-application.store';
import { CompanyStore } from '../companies/services/company.store';
import { CareerOpportunity, IntelligenceService } from '../../core/services/intelligence.service';
import {
  ActivePursuitsWidgetComponent,
  MarketPulseWidgetComponent,
  ScheduleWidgetComponent,
  StatusSummaryItem,
} from './components';

interface DashboardMetric {
  label: string;
  value: number;
  toneClass: string;
}

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
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ScheduleWidgetComponent,
    MarketPulseWidgetComponent,
    ActivePursuitsWidgetComponent,
  ],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Search,
        Briefcase,
        TrendingUp,
        BellDot,
        Globe,
        MapPin,
        Sparkles,
        Cog,
        CircleQuestionMark,
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
  private readonly intelligenceService = inject(IntelligenceService);

  readonly searchTerm = signal('');
  readonly isLoadingOpportunities = signal(false);
  readonly opportunities = signal<CareerOpportunity[]>([]);

  readonly applications = this.applicationStore.applications;
  readonly companies = this.companyStore.companies;
  readonly metrics = this.applicationStore.metrics;
  readonly isLoadingApplications = this.applicationStore.isLoading;

  readonly dashboardMetrics = computed<DashboardMetric[]>(() => [
    { label: 'Total Applications', value: this.metrics().total, toneClass: 'text-foreground' },
    { label: 'Active Pipeline', value: this.metrics().active, toneClass: 'text-primary' },
    { label: 'Interviewing', value: this.metrics().interviewing, toneClass: 'text-warning' },
    { label: 'Offers', value: this.metrics().offers, toneClass: 'text-success' },
  ]);

  readonly statusSummary = computed<StatusSummaryItem[]>(() => {
    const apps = this.applications();
    const groups = [
      JobApplicationStatus.Applied,
      JobApplicationStatus.PhoneScreen,
      JobApplicationStatus.Interviewing,
      JobApplicationStatus.TechnicalTask,
      JobApplicationStatus.Offer,
      JobApplicationStatus.Rejected,
      JobApplicationStatus.Ghosted,
    ];

    return groups.map((status) => ({
      label: this.getStatusLabel(status),
      count: apps.filter((app) => app.status === status).length,
      toneClass: getStatusStyles(status),
    }));
  });

  readonly recentApplications = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const apps = [...this.applications()].sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );

    const filtered = term
      ? apps.filter((app) =>
          [app.position, app.companyName, app.description]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term)),
        )
      : apps;

    return filtered.slice(0, 8);
  });

  readonly freshOpportunities = computed(() =>
    [...this.opportunities()].sort((a, b) => b.matchScore - a.matchScore).slice(0, 5),
  );

  readonly mapPoints = computed<LocationPoint[]>(() => {
    const appPoints = this.buildApplicationPoints(this.applications(), this.companies());
    const opportunityPoints = this.buildOpportunityPoints(this.opportunities());

    return [...appPoints, ...opportunityPoints].slice(0, 12);
  });

  readonly totalTrackedLocations = computed(() => this.mapPoints().length);

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
    this.loadOpportunities();
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  private getStatusLabel(status: JobApplicationStatus): string {
    return JobApplicationStatus[status].replaceAll(/([A-Z])/g, ' $1').trim();
  }

  trackByLocation(_: number, point: LocationPoint): string {
    return point.id;
  }

  private async loadOpportunities(): Promise<void> {
    this.isLoadingOpportunities.set(true);
    try {
      const items = await firstValueFrom(this.intelligenceService.getCareerOpportunities());
      this.opportunities.set(items);
    } catch {
      this.opportunities.set([]);
    } finally {
      this.isLoadingOpportunities.set(false);
    }
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

  private buildOpportunityPoints(opportunities: CareerOpportunity[]): LocationPoint[] {
    return opportunities.slice(0, 6).map((opportunity, index) => {
      const coord = this.resolveLocationCoordinate(opportunity.location);

      return {
        id: `opportunity-${opportunity.id}`,
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
