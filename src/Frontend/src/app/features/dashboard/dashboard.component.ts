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

interface BriefingItem {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MomentumGaugeComponent,
    StatCardComponent,
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

  readonly isLoading = computed(
    () => this.applicationStore.isLoading() || this.companyStore.isLoading(),
  );

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

  readonly weeklyTrend = computed(() => {
    const now = this.now();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const count = this.applications().filter(
      (app) => new Date(app.appliedAt) >= oneWeekAgo,
    ).length;

    return count > 0 ? `+${count} this week` : 'No new this week';
  });

  readonly momentumScore = computed(() => {
    const total = this.totalApplications();
    if (total === 0) {
      return 0;
    }

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
      items.push({
        icon: '🏆',
        text: `${offers} offer${offers === 1 ? '' : 's'} received`,
      });
    }

    if (items.length === 0) {
      items.push({
        icon: '🚀',
        text: 'Ready to launch — start applying today',
      });
    }

    return items.slice(0, 3);
  });

  ngOnInit(): void {
    this.applicationStore.loadAll();
    this.companyStore.loadAll();
  }

  trackByApplication(_: number, app: JobApplication): string {
    return app.id;
  }
}
