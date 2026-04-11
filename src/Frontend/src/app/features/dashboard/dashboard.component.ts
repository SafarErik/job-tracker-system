import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageService } from '../../core/services';
import { JobApplication } from '../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../job-applications/models/application-status.enum';
import { JobApplicationStore } from '../job-applications/services/job-application.store';
import { CompanyStore } from '../companies/services/company.store';
import { MomentumGaugeComponent } from './components/momentum-gauge/momentum-gauge.component';
import {
  FootprintLocation,
  GlobalFootprintComponent,
} from './components/global-footprint/global-footprint.component';
import { PipelineTableCardComponent } from './components/pipeline-table-card/pipeline-table-card.component';
import { PipelineStage } from './components/pipeline-chart/pipeline-chart.component';
import { buildFootprintLocations } from './data/footprint-locations';

interface BriefingItem {
  text: string;
}

interface SuggestedAction {
  eyebrow: string;
  title: string;
  meta: string;
  cta: string;
  route: string;
  tone: 'primary' | 'attention' | 'neutral';
}

interface PipelineStageSummary {
  label: string;
  count: number;
  helper: string;
  action: string;
  state: 'strong' | 'watch' | 'quiet';
}

interface MomentumDiagnosis {
  label: string;
  body: string;
  recommendation: string;
  cta: string;
  route: string;
}

interface PipelineInsight {
  label: string;
  body: string;
  recommendation: string;
  target: string;
}

interface ReadinessItem {
  label: string;
  value: string;
  body: string;
  state: 'ready' | 'watch' | 'quiet';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    TranslocoPipe,
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
  private readonly languageService = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);

  readonly now = signal(new Date());
  readonly applications = this.applicationStore.applications;
  readonly metrics = this.applicationStore.metrics;
  readonly companies = this.companyStore.companies;

  readonly isLoading = computed(
    () => this.applicationStore.isLoading() || this.companyStore.isLoading(),
  );

  readonly greetingPeriod = computed(() => {
    const hour = this.now().getHours();
    if (hour < 12) return 'dashboard.period.morning';
    if (hour < 18) return 'dashboard.period.afternoon';
    return 'dashboard.period.evening';
  });

  readonly userName = computed(() => {
    const user = this.authService.user();
    if (!user) return '';
    return user.firstName?.trim() || user.email?.split('@')[0] || '';
  });

  readonly currentDateLabel = computed(() =>
    new Intl.DateTimeFormat(this.languageService.locale() === 'hu' ? 'hu-HU' : 'en-US', {
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
  readonly screenCount = computed(
    () =>
      this.applications().filter(
        (app) =>
          app.status === JobApplicationStatus.PhoneScreen ||
          app.status === JobApplicationStatus.TechnicalTask,
      ).length,
  );
  readonly appliedCount = computed(
    () =>
      this.applications().filter((app) => app.status === JobApplicationStatus.Applied).length,
  );
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

  readonly stateSummary = computed(() => {
    const total = this.totalApplications();
    if (total === 0) {
      return this.t('dashboard.focus.summary.empty');
    }

    const interviews = this.activePipeline();
    const followUps = this.dueFollowUps();
    const offers = this.offersCount();

    if (offers > 0) {
      return this.t('dashboard.focus.summary.offers', { count: offers });
    }

    if (interviews > 0) {
      return this.t('dashboard.focus.summary.interviews', { count: interviews });
    }

    if (followUps > 0) {
      return this.t('dashboard.focus.summary.followUps', { count: followUps });
    }

    return this.t('dashboard.focus.summary.default', { count: total });
  });

  readonly dailyBriefing = computed<BriefingItem[]>(() => {
    const items: BriefingItem[] = [];
    const pipeline = this.activePipeline();
    const followUps = this.dueFollowUps();
    const offers = this.offersCount();

    if (pipeline > 0) {
      items.push({ text: this.t('dashboard.focus.briefing.interviews', { count: pipeline }) });
    }
    if (followUps > 0) {
      items.push({ text: this.t('dashboard.focus.briefing.followUps', { count: followUps }) });
    }
    if (offers > 0) {
      items.push({ text: this.t('dashboard.focus.briefing.offers', { count: offers }) });
    }
    if (items.length === 0) items.push({ text: this.t('dashboard.focus.briefing.empty') });

    return items.slice(0, 2);
  });

  readonly momentumDiagnosis = computed<MomentumDiagnosis>(() => {
    const total = this.totalApplications();
    const score = this.momentumScore();
    const interviews = this.activePipeline();
    const offers = this.offersCount();
    const applied = this.appliedCount();

    if (total === 0) {
      return {
        label: this.t('dashboard.momentum.states.noSignal.label'),
        body: this.t('dashboard.momentum.states.noSignal.body'),
        recommendation: this.t('dashboard.momentum.states.noSignal.recommendation'),
        cta: this.t('dashboard.actions.addOpportunity'),
        route: '/new',
      };
    }

    if (offers > 0) {
      return {
        label: this.t('dashboard.momentum.states.decision.label'),
        body: this.t('dashboard.momentum.states.decision.body'),
        recommendation: this.t('dashboard.momentum.states.decision.recommendation'),
        cta: this.t('dashboard.momentum.states.decision.cta'),
        route: '/applications',
      };
    }

    if (interviews === 0 && total >= 5) {
      return {
        label: this.t('dashboard.momentum.states.noLoops.label'),
        body: this.t('dashboard.momentum.states.noLoops.body'),
        recommendation: this.t('dashboard.momentum.states.noLoops.recommendation'),
        cta: this.t('dashboard.momentum.states.noLoops.cta'),
        route: '/applications',
      };
    }

    if (applied < 3 && score < 55) {
      return {
        label: this.t('dashboard.momentum.states.thinFunnel.label'),
        body: this.t('dashboard.momentum.states.thinFunnel.body'),
        recommendation: this.t('dashboard.momentum.states.thinFunnel.recommendation'),
        cta: this.t('dashboard.actions.addOpportunity'),
        route: '/new',
      };
    }

    if (interviews > 0) {
      return {
        label: this.t('dashboard.momentum.states.interview.label'),
        body: this.t('dashboard.momentum.states.interview.body'),
        recommendation: this.t('dashboard.momentum.states.interview.recommendation'),
        cta: this.t('dashboard.momentum.states.interview.cta'),
        route: '/applications',
      };
    }

    return {
      label: score >= 70
        ? this.t('dashboard.momentum.states.healthy.label')
        : this.t('dashboard.momentum.states.building.label'),
      body: score >= 70
        ? this.t('dashboard.momentum.states.healthy.body')
        : this.t('dashboard.momentum.states.building.body'),
      recommendation: this.t('dashboard.momentum.states.building.recommendation'),
      cta: this.t('dashboard.workQueue.open'),
      route: '/applications',
    };
  });

  readonly funnelStages = computed<PipelineStage[]>(() => {
    const apps = this.applications();

    return [
      {
        label: this.t('dashboard.pipeline.stages.applied.label'),
        count: apps.filter((app) => app.status === JobApplicationStatus.Applied).length,
      },
      {
        label: this.t('dashboard.pipeline.stages.screen.label'),
        count: apps.filter(
          (app) =>
            app.status === JobApplicationStatus.PhoneScreen ||
            app.status === JobApplicationStatus.TechnicalTask,
        ).length,
      },
      {
        label: this.t('dashboard.pipeline.stages.interview.label'),
        count: apps.filter((app) => app.status === JobApplicationStatus.Interviewing).length,
      },
      {
        label: this.t('dashboard.pipeline.stages.offer.label'),
        count: apps.filter((app) => app.status === JobApplicationStatus.Offer).length,
      },
    ];
  });

  readonly pipelineStageSummaries = computed<PipelineStageSummary[]>(() => {
    const applied = this.appliedCount();
    const screen = this.screenCount();
    const interview = this.activePipeline();
    const offers = this.offersCount();

    return [
      {
        label: this.t('dashboard.pipeline.stages.applied.label'),
        count: applied,
        helper: this.t('dashboard.pipeline.stages.applied.helper'),
        action:
          applied < 3
            ? this.t('dashboard.pipeline.stages.applied.actionMore', { count: 3 - applied })
            : this.t('dashboard.pipeline.stages.applied.actionMaintain'),
        state: applied === 0 ? 'quiet' : applied < 3 ? 'watch' : 'strong',
      },
      {
        label: this.t('dashboard.pipeline.stages.screen.label'),
        count: screen,
        helper: this.t('dashboard.pipeline.stages.screen.helper'),
        action:
          screen === 0
            ? this.t('dashboard.pipeline.stages.screen.actionImprove')
            : this.t('dashboard.pipeline.stages.screen.actionKeepWarm'),
        state: screen === 0 && applied > 0 ? 'watch' : screen > 0 ? 'strong' : 'quiet',
      },
      {
        label: this.t('dashboard.pipeline.stages.interview.label'),
        count: interview,
        helper: this.t('dashboard.pipeline.stages.interview.helper'),
        action:
          interview === 0
            ? this.t('dashboard.pipeline.stages.interview.actionPrepare')
            : this.t('dashboard.pipeline.stages.interview.actionPractice'),
        state: interview === 0 && screen > 0 ? 'watch' : interview > 0 ? 'strong' : 'quiet',
      },
      {
        label: this.t('dashboard.pipeline.stages.offer.label'),
        count: offers,
        helper: this.t('dashboard.pipeline.stages.offer.helper'),
        action:
          offers === 0
            ? this.t('dashboard.pipeline.stages.offer.actionNotYet')
            : this.t('dashboard.pipeline.stages.offer.actionReview'),
        state: offers > 0 ? 'strong' : 'quiet',
      },
    ];
  });

  readonly pipelineInsight = computed<PipelineInsight>(() => {
    const total = this.totalApplications();
    const applied = this.appliedCount();
    const screen = this.screenCount();
    const interviews = this.activePipeline();
    const offers = this.offersCount();

    if (total === 0) {
      return {
        label: this.t('dashboard.pipeline.insights.empty.label'),
        body: this.t('dashboard.pipeline.insights.empty.body'),
        recommendation: this.t('dashboard.pipeline.insights.empty.recommendation'),
        target: this.t('dashboard.pipeline.insights.empty.target'),
      };
    }

    if (offers > 0) {
      return {
        label: this.t('dashboard.pipeline.insights.decision.label'),
        body: this.t('dashboard.pipeline.insights.decision.body'),
        recommendation: this.t('dashboard.pipeline.insights.decision.recommendation'),
        target: this.t('dashboard.pipeline.insights.decision.target'),
      };
    }

    if (applied > 0 && screen === 0 && interviews === 0) {
      return {
        label: this.t('dashboard.pipeline.insights.topHeavy.label'),
        body: this.t('dashboard.pipeline.insights.topHeavy.body'),
        recommendation: this.t('dashboard.pipeline.insights.topHeavy.recommendation'),
        target: this.t('dashboard.pipeline.insights.topHeavy.target'),
      };
    }

    if (screen > 0 && interviews === 0) {
      return {
        label: this.t('dashboard.pipeline.insights.screening.label'),
        body: this.t('dashboard.pipeline.insights.screening.body'),
        recommendation: this.t('dashboard.pipeline.insights.screening.recommendation'),
        target: this.t('dashboard.pipeline.insights.screening.target'),
      };
    }

    if (interviews > 0) {
      return {
        label: this.t('dashboard.pipeline.insights.activeLoop.label'),
        body: this.t('dashboard.pipeline.insights.activeLoop.body'),
        recommendation: this.t('dashboard.pipeline.insights.activeLoop.recommendation'),
        target: this.t('dashboard.pipeline.insights.activeLoop.target'),
      };
    }

    return {
      label: this.t('dashboard.pipeline.insights.forming.label'),
      body: this.t('dashboard.pipeline.insights.forming.body'),
      recommendation: this.t('dashboard.pipeline.insights.forming.recommendation'),
      target: this.t('dashboard.pipeline.insights.forming.target'),
    };
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
          company: companyLookup.get(app.companyId)?.name ?? app.companyName ?? this.t('dashboard.workQueue.companyFallback'),
          kind,
        });
      }
    }

    const order: Record<string, number> = { interview: 0, offer: 1, 'follow-up': 2 };
    return items.sort((left, right) => order[left.kind] - order[right.kind]).slice(0, 3);
  });

  readonly suggestedActions = computed<SuggestedAction[]>(() => {
    const priority = this.priorityItems();

    if (priority.length > 0) {
      return priority.map((item) => ({
        eyebrow:
          item.kind === 'interview'
            ? this.t('dashboard.suggestedActions.interview.eyebrow')
            : item.kind === 'offer'
              ? this.t('dashboard.suggestedActions.offer.eyebrow')
              : this.t('dashboard.suggestedActions.followUp.eyebrow'),
        title: this.t('dashboard.suggestedActions.roleAtCompany', {
          role: item.position,
          company: item.company,
        }),
        meta:
          item.kind === 'interview'
            ? this.t('dashboard.suggestedActions.interview.meta')
            : item.kind === 'offer'
              ? this.t('dashboard.suggestedActions.offer.meta')
              : this.t('dashboard.suggestedActions.followUp.meta'),
        cta:
          item.kind === 'interview'
            ? this.t('dashboard.suggestedActions.interview.cta')
            : item.kind === 'offer'
              ? this.t('dashboard.suggestedActions.offer.cta')
              : this.t('dashboard.suggestedActions.followUp.cta'),
        route: `/applications/${item.id}`,
        tone: item.kind === 'interview' ? 'primary' : item.kind === 'offer' ? 'attention' : 'neutral',
      }));
    }

    return [
      {
        eyebrow: this.t('dashboard.suggestedActions.empty.add.eyebrow'),
        title: this.t('dashboard.suggestedActions.empty.add.title'),
        meta: this.t('dashboard.suggestedActions.empty.add.meta'),
        cta: this.t('dashboard.suggestedActions.empty.add.cta'),
        route: '/new',
        tone: 'primary',
      },
      {
        eyebrow: this.t('dashboard.suggestedActions.empty.documents.eyebrow'),
        title: this.t('dashboard.suggestedActions.empty.documents.title'),
        meta: this.t('dashboard.suggestedActions.empty.documents.meta'),
        cta: this.t('dashboard.suggestedActions.empty.documents.cta'),
        route: '/documents',
        tone: 'neutral',
      },
    ];
  });

  readonly readinessItems = computed<ReadinessItem[]>(() => {
    const apps = this.applications();
    const total = this.totalApplications();
    const documentReady = apps.filter((app) => Boolean(app.documentId)).length;
    const highFit = apps.filter((app) => (app.matchScore ?? 0) >= 75).length;
    const interviews = this.activePipeline();

    return [
      {
        label: this.t('dashboard.readiness.items.documents.label'),
        value: total === 0 ? '0' : `${documentReady}/${total}`,
        body:
          documentReady > 0
            ? this.t('dashboard.readiness.items.documents.ready')
            : this.t('dashboard.readiness.items.documents.empty'),
        state: documentReady > 0 ? 'ready' : 'watch',
      },
      {
        label: this.t('dashboard.readiness.items.fit.label'),
        value: `${highFit}`,
        body:
          highFit > 0
            ? this.t('dashboard.readiness.items.fit.ready')
            : this.t('dashboard.readiness.items.fit.empty'),
        state: highFit > 0 ? 'ready' : 'quiet',
      },
      {
        label: this.t('dashboard.readiness.items.practice.label'),
        value: `${interviews}`,
        body:
          interviews > 0
            ? this.t('dashboard.readiness.items.practice.ready')
            : this.t('dashboard.readiness.items.practice.empty'),
        state: interviews > 0 ? 'ready' : 'quiet',
      },
    ];
  });

  readonly footprintLocations = computed<FootprintLocation[]>(() =>
    buildFootprintLocations(this.applications(), this.companies()),
  );

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }

  getActionClass(tone: SuggestedAction['tone']): string {
    if (tone === 'primary') return 'dashboard-action-card--primary';
    if (tone === 'attention') return 'dashboard-action-card--attention';
    return '';
  }

  getStageClass(state: PipelineStageSummary['state']): string {
    if (state === 'strong') return 'pipeline-stage--strong';
    if (state === 'watch') return 'pipeline-stage--watch';
    return 'pipeline-stage--quiet';
  }

  getReadinessClass(state: ReadinessItem['state']): string {
    if (state === 'ready') return 'readiness-item--ready';
    if (state === 'watch') return 'readiness-item--watch';
    return 'readiness-item--quiet';
  }

  trackByApplication(_: number, app: JobApplication): string {
    return app.id;
  }

  private t(key: string, params?: Record<string, unknown>): string {
    this.languageService.locale();
    return this.transloco.translate(key, params);
  }
}
