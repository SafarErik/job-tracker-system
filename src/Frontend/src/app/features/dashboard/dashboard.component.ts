import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AuthService } from '../../core/auth/auth.service';
import { JobApplication } from '../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../job-applications/models/application-status.enum';
import { JobApplicationStore } from '../job-applications/services/job-application.store';
import { CompanyStore } from '../companies/services/company.store';
import { MomentumGaugeComponent } from './components/momentum-gauge/momentum-gauge.component';
import {
  GlobalFootprintComponent,
  LocationPoint,
} from './components/global-footprint/global-footprint.component';
import { PipelineTableCardComponent } from './components/pipeline-table-card/pipeline-table-card.component';
import { PipelineStage } from './components/pipeline-chart/pipeline-chart.component';

interface BriefingItem {
  text: string;
}

interface SuggestedAction {
  eyebrow: string;
  title: string;
  meta: string;
}

interface PipelineStageSummary {
  label: string;
  count: number;
  helper: string;
}

const LOCATION_COORDINATES: Record<string, { x: number; y: number }> = {
  London: { x: 47, y: 28 },
  'New York': { x: 26, y: 35 },
  'San Francisco': { x: 12, y: 37 },
  Berlin: { x: 51, y: 27 },
  Amsterdam: { x: 49, y: 26 },
  Paris: { x: 48, y: 30 },
  Dublin: { x: 44, y: 26 },
  Singapore: { x: 80, y: 55 },
  Sydney: { x: 85, y: 72 },
  Tokyo: { x: 88, y: 36 },
  Toronto: { x: 23, y: 30 },
  'Los Angeles': { x: 11, y: 39 },
  Chicago: { x: 21, y: 33 },
  Seattle: { x: 11, y: 32 },
  Austin: { x: 18, y: 41 },
  Remote: { x: 50, y: 50 },
};

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MomentumGaugeComponent,
    GlobalFootprintComponent,
    PipelineTableCardComponent,
    ...HlmSkeletonImports,
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
  readonly metrics = this.applicationStore.metrics;
  readonly companies = this.companyStore.companies;

  readonly isLoading = computed(
    () => this.applicationStore.isLoading() || this.companyStore.isLoading(),
  );

  readonly greetingPeriod = computed(() => {
    const hour = this.now().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  });

  readonly userName = computed(() => {
    const user = this.authService.user();
    if (!user) return 'Operator';
    return user.firstName?.trim() || user.email?.split('@')[0] || 'Operator';
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

  readonly momentumScore = computed(() => {
    const total = this.totalApplications();
    if (total === 0) return 0;

    const pipelineWeight = Math.min(this.activePipeline() * 15, 40);
    const offerWeight = Math.min(this.offersCount() * 20, 30);
    const activityWeight = Math.min(total * 2, 30);
    return Math.min(100, pipelineWeight + offerWeight + activityWeight);
  });

  readonly dailyBriefing = computed<BriefingItem[]>(() => {
    const items: BriefingItem[] = [];
    const pipeline = this.activePipeline();
    const followUps = this.dueFollowUps();
    const offers = this.offersCount();

    if (pipeline > 0) items.push({ text: `${pipeline} active interview${pipeline === 1 ? '' : 's'} in pipeline` });
    if (followUps > 0) items.push({ text: `${followUps} follow-up${followUps === 1 ? '' : 's'} pending` });
    if (offers > 0) items.push({ text: `${offers} offer${offers === 1 ? '' : 's'} received` });
    if (items.length === 0) items.push({ text: 'Ready to launch, start applying today' });

    return items.slice(0, 2);
  });

  readonly funnelStages = computed<PipelineStage[]>(() => {
    const apps = this.applications();

    return [
      { label: 'Applied', count: apps.filter((app) => app.status === JobApplicationStatus.Applied).length },
      {
        label: 'Screen',
        count: apps.filter(
          (app) =>
            app.status === JobApplicationStatus.PhoneScreen ||
            app.status === JobApplicationStatus.TechnicalTask,
        ).length,
      },
      { label: 'Interview', count: apps.filter((app) => app.status === JobApplicationStatus.Interviewing).length },
      { label: 'Offer', count: apps.filter((app) => app.status === JobApplicationStatus.Offer).length },
    ];
  });

  readonly pipelineStageSummaries = computed<PipelineStageSummary[]>(() => {
    const stageCopy: Record<string, string> = {
      Applied: 'Outbound volume',
      Screen: 'Warm conversations',
      Interview: 'Active loops',
      Offer: 'Decision zone',
    };

    return this.funnelStages().map((stage) => ({
      label: stage.label,
      count: stage.count,
      helper: stageCopy[stage.label] ?? 'Pipeline stage',
    }));
  });

  readonly companyMap = computed(() => {
    const map = new Map<string, { name: string; logoUrl?: string }>();
    for (const company of this.companies()) {
      map.set(company.id, { name: company.name, logoUrl: company.logoUrl });
    }
    return map;
  });

  readonly priorityItems = computed(() => {
    const apps = this.applications();
    const companyLookup = this.companyMap();
    const items: Array<{
      id: string;
      position: string;
      company: string;
      kind: 'interview' | 'offer' | 'follow-up';
    }> = [];

    for (const app of apps) {
      let kind: 'interview' | 'offer' | 'follow-up' | null = null;

      switch (app.status) {
        case JobApplicationStatus.Interviewing:
          kind = 'interview';
          break;
        case JobApplicationStatus.Offer:
          kind = 'offer';
          break;
        case JobApplicationStatus.Applied:
        case JobApplicationStatus.PhoneScreen:
          kind = 'follow-up';
          break;
      }

      if (kind) {
        items.push({
          id: app.id,
          position: app.position,
          company: companyLookup.get(app.companyId)?.name ?? app.companyName ?? 'Company',
          kind,
        });
      }
    }

    const order: Record<string, number> = { interview: 0, offer: 1, 'follow-up': 2 };
    return items.sort((left, right) => order[left.kind] - order[right.kind]).slice(0, 2);
  });

  readonly suggestedActions = computed<SuggestedAction[]>(() => {
    const priority = this.priorityItems();

    if (priority.length > 0) {
      return priority.map((item) => ({
        eyebrow:
          item.kind === 'interview'
            ? 'Prepare now'
            : item.kind === 'offer'
              ? 'Decision lane'
              : 'Follow-up',
        title: `${item.position} at ${item.company}`,
        meta:
          item.kind === 'interview'
            ? 'High-leverage prep window open'
            : item.kind === 'offer'
              ? 'Review package and response timing'
              : 'Keep the thread warm and visible',
      }));
    }

    return [
      {
        eyebrow: 'Start momentum',
        title: 'Add your next target company',
        meta: 'Fresh opportunities create better signal quality',
      },
      {
        eyebrow: 'Sharpen profile',
        title: 'Refresh CV and portfolio narrative',
        meta: 'Make your materials ready before volume increases',
      },
    ];
  });

  readonly mapPoints = computed<LocationPoint[]>(() => {
    const apps = this.applications();
    const companyList = this.companies();
    const locationMap = new Map<string, { count: number; label: string }>();

    for (const app of apps) {
      const company = companyList.find((candidate) => candidate.id === app.companyId);
      const location = company?.hqLocation || 'Remote';
      const key = location.split(',')[0].trim();

      if (!locationMap.has(key)) {
        locationMap.set(key, { count: 0, label: key });
      }

      locationMap.get(key)!.count++;
    }

    const stableSeededOffset = (key: string): { x: number; y: number } => {
      let hash = 0;
      for (let index = 0; index < key.length; index++) {
        hash = (hash << 5) - hash + key.charCodeAt(index);
        hash &= hash;
      }

      return {
        x: (Math.abs(hash) % 20) - 10,
        y: ((hash >> 2) % 16) - 8,
      };
    };

    const points: LocationPoint[] = [];
    for (const [key, data] of locationMap) {
      const coords = LOCATION_COORDINATES[key] ?? {
        x: 50 + stableSeededOffset(key).x,
        y: 40 + stableSeededOffset(key).y,
      };

      points.push({
        id: key,
        label: key,
        detail: key,
        x: coords.x,
        y: coords.y,
        kind: 'application',
        count: data.count,
      });
    }

    return points;
  });

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }

  trackByApplication(_: number, app: JobApplication): string {
    return app.id;
  }
}
