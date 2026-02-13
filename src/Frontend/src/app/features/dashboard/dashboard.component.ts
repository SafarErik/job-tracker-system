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
import { StatCardComponent } from './components/stat-card/stat-card.component';
import {
  SkillRadarComponent,
  SkillRadarAxis,
} from './components/skill-radar/skill-radar.component';
import {
  GlobalFootprintComponent,
  LocationPoint,
} from './components/global-footprint/global-footprint.component';
import {
  ActivityFeedComponent,
  FeedItem,
} from './components/activity-feed/activity-feed.component';
import { PipelineTableCardComponent } from './components/pipeline-table-card/pipeline-table-card.component';
import {
  TacticalPriorityComponent,
  PriorityItem,
} from './components/tactical-priority/tactical-priority.component';
import { PipelineStage } from './components/pipeline-chart/pipeline-chart.component';

interface BriefingItem {
  icon: string;
  text: string;
}

/** Map hqLocation strings to approximate percentage coordinates on our SVG map */
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
    StatCardComponent,
    SkillRadarComponent,
    GlobalFootprintComponent,
    ActivityFeedComponent,
    PipelineTableCardComponent,
    TacticalPriorityComponent,
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

  // ── Hero Section ─────────────────────────────────────────

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

  // ── Stat Card Metrics ────────────────────────────────────

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
    if (total === 0) return 0;
    return Math.round((this.offersCount() / total) * 100);
  });

  readonly nextAction = computed(() => {
    const interviews = this.activePipeline();
    if (interviews > 0) {
      const label = interviews === 1 ? 'Interview pending' : 'Interviews pending';
      return label;
    }
    const count = this.dueFollowUps();
    if (count === 0) return 'No follow-ups due';
    return `${count} Follow-up(s) due`;
  });

  readonly weeklyTrend = computed(() => {
    const now = this.now();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const count = this.applications().filter((app) => new Date(app.appliedAt) >= oneWeekAgo).length;
    return count > 0 ? `+${count} this week` : 'No new this week';
  });

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

    if (pipeline > 0) {
      items.push({
        icon: '🎯',
        text: `${pipeline} active interview${pipeline === 1 ? '' : 's'} in pipeline`,
      });
    }
    if (followUps > 0) {
      items.push({
        icon: '📬',
        text: `${followUps} follow-up${followUps === 1 ? '' : 's'} pending`,
      });
    }
    if (offers > 0) {
      items.push({ icon: '🏆', text: `${offers} offer${offers === 1 ? '' : 's'} received` });
    }
    if (items.length === 0) {
      items.push({ icon: '🚀', text: 'Ready to launch — start applying today' });
    }
    return items.slice(0, 3);
  });

  // ── Row 3: Skill Radar ──────────────────────────────────

  readonly skillRadarData = computed<SkillRadarAxis[]>(() => {
    const apps = this.applications();
    const skillBuckets: Record<string, number> = {
      Frontend: 0,
      Backend: 0,
      DevOps: 0,
      'Soft Skills': 0,
      Product: 0,
    };

    const frontendKeywords = [
      'react',
      'angular',
      'vue',
      'css',
      'html',
      'typescript',
      'javascript',
      'frontend',
      'ui',
      'ux',
    ];
    const backendKeywords = [
      'node',
      'python',
      'java',
      'c#',
      '.net',
      'api',
      'backend',
      'sql',
      'database',
      'rust',
      'go',
    ];
    const devopsKeywords = [
      'docker',
      'kubernetes',
      'ci/cd',
      'aws',
      'azure',
      'gcp',
      'devops',
      'terraform',
      'linux',
    ];
    const productKeywords = [
      'product',
      'agile',
      'scrum',
      'jira',
      'management',
      'strategy',
      'analytics',
    ];

    for (const app of apps) {
      const allSkills = app.skills.map((s) => s.toLowerCase());
      const pos = app.position.toLowerCase();
      const combined = [...allSkills, pos].join(' ');

      if (frontendKeywords.some((k) => combined.includes(k))) skillBuckets['Frontend']++;
      if (backendKeywords.some((k) => combined.includes(k))) skillBuckets['Backend']++;
      if (devopsKeywords.some((k) => combined.includes(k))) skillBuckets['DevOps']++;
      if (productKeywords.some((k) => combined.includes(k))) skillBuckets['Product']++;
      skillBuckets['Soft Skills'] += allSkills.length > 0 ? 1 : 0;
    }

    const max = Math.max(...Object.values(skillBuckets), 1);

    return [
      {
        label: 'Frontend',
        userScore: Math.round((skillBuckets['Frontend'] / max) * 100),
        marketScore: 75,
      },
      {
        label: 'Backend',
        userScore: Math.round((skillBuckets['Backend'] / max) * 100),
        marketScore: 82,
      },
      {
        label: 'DevOps',
        userScore: Math.round((skillBuckets['DevOps'] / max) * 100),
        marketScore: 60,
      },
      {
        label: 'Soft Skills',
        userScore: Math.round((skillBuckets['Soft Skills'] / max) * 100),
        marketScore: 55,
      },
      {
        label: 'Product',
        userScore: Math.round((skillBuckets['Product'] / max) * 100),
        marketScore: 45,
      },
    ];
  });

  // ── Row 3: Global Footprint ─────────────────────────────

  readonly mapPoints = computed<LocationPoint[]>(() => {
    const apps = this.applications();
    const companyList = this.companies();
    const locationMap = new Map<string, { count: number; label: string }>();

    for (const app of apps) {
      const company = companyList.find((c) => c.id === app.companyId);
      const location = company?.hqLocation || 'Remote';
      const key = location.split(',')[0].trim();

      if (!locationMap.has(key)) {
        locationMap.set(key, { count: 0, label: key });
      }
      locationMap.get(key)!.count++;
    }

    // Deterministic hash function for consistent offsets
    const stableSeededOffset = (key: string): { x: number; y: number } => {
      let hash = 0;
      for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      // Normalize to range [-10, 10] for x and [-8, 8] for y
      const x = (Math.abs(hash) % 20) - 10;
      const y = ((hash >> 2) % 16) - 8;
      return { x, y };
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

  // ── Row 4: Activity Feed ────────────────────────────────

  readonly feedItems = computed<FeedItem[]>(() => {
    const apps = [...this.applications()]
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 10);

    return apps.map((app) => {
      const now = this.now();
      const d = new Date(app.appliedAt);
      const diffMs = now.getTime() - d.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const time = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`;

      let icon: string;
      let type: 'match' | 'status' | 'alert';

      switch (app.status) {
        case JobApplicationStatus.Interviewing:
          icon = '🎙️';
          type = 'status';
          break;
        case JobApplicationStatus.Offer:
          icon = '🏆';
          type = 'status';
          break;
        case JobApplicationStatus.Rejected:
        case JobApplicationStatus.Ghosted:
          icon = '⚠️';
          type = 'alert';
          break;
        default:
          icon = '📄';
          type = 'match';
          break;
      }

      return {
        icon,
        label: `${app.position} — ${app.companyName || 'Company'}`,
        time,
        type,
      };
    });
  });

  // ── Row 4: Pipeline Table ───────────────────────────────

  readonly funnelStages = computed<PipelineStage[]>(() => {
    const apps = this.applications();

    return [
      {
        label: 'Applied',
        count: apps.filter((a) => a.status === JobApplicationStatus.Applied).length,
      },
      {
        label: 'Screen',
        count: apps.filter(
          (a) =>
            a.status === JobApplicationStatus.PhoneScreen ||
            a.status === JobApplicationStatus.TechnicalTask,
        ).length,
      },
      {
        label: 'Interview',
        count: apps.filter((a) => a.status === JobApplicationStatus.Interviewing).length,
      },
      { label: 'Offer', count: apps.filter((a) => a.status === JobApplicationStatus.Offer).length },
    ];
  });

  readonly companyMap = computed(() => {
    const map = new Map<string, { name: string; logoUrl?: string }>();
    for (const c of this.companies()) {
      map.set(c.id, { name: c.name, logoUrl: c.logoUrl });
    }
    return map;
  });

  // ── Row 5: Tactical Priority ─────────────────────────────

  readonly priorityItems = computed<PriorityItem[]>(() => {
    const apps = this.applications();
    const companyLookup = this.companyMap();

    const items: PriorityItem[] = [];

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

    // Sort: interviews first, then offers, then follow-ups
    const order: Record<string, number> = { interview: 0, offer: 1, 'follow-up': 2 };
    return items.sort((a, b) => order[a.kind] - order[b.kind]).slice(0, 10);
  });

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }

  trackByApplication(_: number, app: JobApplication): string {
    return app.id;
  }
}
