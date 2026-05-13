import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { provideIcons, NgIcon } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideBuilding2,
  lucideCheckCircle2,
  lucideChevronDown,
  lucideChevronUp,
  lucideClock,
  lucideExternalLink,
  lucideFilter,
  lucideMapPin,
  lucidePlus,
  lucideRadio,
  lucideTrendingUp,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '../../../../libs/ui/skeleton/src/lib/hlm-skeleton';
import { NotificationService } from '../../core/services/notification.service';
import {
  CareerOpportunity,
  GlobalSignal,
  IntelligenceService,
} from '../../core/services/intelligence.service';
import { ProfileStore } from '../profile/services/profile.store';
import { ApplicationService } from '../job-applications/services/application.service';
import { CreateJobApplication } from '../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../job-applications/models/application-status.enum';
import { CompanyStore } from '../companies/services/company.store';
import { CompanyPriority } from '../companies/models/company-priority.enum';

type VadisTab = 'signals' | 'opportunities';

@Component({
  selector: 'app-signals',
  imports: [CommonModule, DatePipe, NgIcon, HlmSkeleton, ...HlmButtonImports],
  templateUrl: './signals.component.html',
  styleUrls: ['./signals.component.css'],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucideBuilding2,
      lucideCheckCircle2,
      lucideChevronDown,
      lucideChevronUp,
      lucideClock,
      lucideExternalLink,
      lucideFilter,
      lucideMapPin,
      lucidePlus,
      lucideRadio,
      lucideTrendingUp,
      lucideX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileStore = inject(ProfileStore);
  private readonly intelligenceService = inject(IntelligenceService);
  private readonly applicationService = inject(ApplicationService);
  private readonly companyStore = inject(CompanyStore);
  private readonly notificationService = inject(NotificationService);

  readonly profile = this.profileStore.profile;
  readonly userSkills = this.profileStore.userSkills;
  readonly activeTab = signal<VadisTab>('signals');
  readonly selectedFilter = signal('All');
  readonly selectedSignal = signal<GlobalSignal | null>(null);
  readonly expandedOpportunityId = signal<string | null>(null);
  readonly savingOpportunityId = signal<string | null>(null);

  private readonly signals = signal<GlobalSignal[]>([]);
  private readonly opportunities = signal<CareerOpportunity[]>([]);
  private readonly isSignalsLoading = signal(true);
  private readonly isOpportunitiesLoading = signal(true);

  readonly isLoading = computed(() =>
    this.activeTab() === 'signals' ? this.isSignalsLoading() : this.isOpportunitiesLoading(),
  );

  readonly skillChips = computed(() => {
    const values = new Set<string>(['All']);
    for (const skill of this.userSkills()) values.add(skill.name);
    for (const signalItem of this.signals()) {
      values.add(signalItem.category);
      signalItem.tags.forEach((tag) => values.add(tag));
    }
    return Array.from(values).slice(0, 10);
  });

  readonly filteredSignals = computed(() => {
    const filter = this.selectedFilter();
    const items = this.signals();
    if (filter === 'All') return items;

    return items.filter(
      (item) =>
        item.category.toLowerCase() === filter.toLowerCase() ||
        item.tags.some((tag) => tag.toLowerCase() === filter.toLowerCase()),
    );
  });

  readonly visibleOpportunities = computed(() => this.opportunities());

  readonly workspaceSummary = computed(() => {
    const title = this.profile()?.currentJobTitle?.trim();
    const skills = this.userSkills().slice(0, 3).map((skill) => skill.name);
    if (title && skills.length) return `${title} profile with ${skills.join(', ')}`;
    if (title) return `${title} profile`;
    if (skills.length) return `${skills.join(', ')} profile`;
    return 'Core preview profile';
  });

  ngOnInit(): void {
    this.companyStore.loadAll();
    this.loadSignals();
    this.loadOpportunities();
  }

  setActiveTab(tab: VadisTab): void {
    this.activeTab.set(tab);
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  openSignal(signalId: string): void {
    const item = this.signals().find((signalItem) => signalItem.id === signalId);
    if (item) this.selectedSignal.set(item);
  }

  closeSignal(): void {
    this.selectedSignal.set(null);
  }

  toggleOpportunity(id: string): void {
    this.expandedOpportunityId.update((current) => (current === id ? null : id));
  }

  saveOpportunity(opportunity: CareerOpportunity): void {
    if (this.savingOpportunityId()) return;

    const existingCompany = this.companyStore
      .companies()
      .find((company) => company.name.toLowerCase() === opportunity.company.toLowerCase());

    this.savingOpportunityId.set(opportunity.id);

    if (existingCompany) {
      this.createApplication(existingCompany.id, opportunity);
      return;
    }

    this.companyStore
      .create({
        name: opportunity.company,
        hqLocation: opportunity.location,
        description: opportunity.description,
        priority: CompanyPriority.MidTier,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (company) => this.createApplication(company.id, opportunity),
        error: () => {
          this.savingOpportunityId.set(null);
          this.notificationService.error(
            'The company could not be created for this opportunity.',
            'Opportunity not saved',
          );
        },
      });
  }

  getImpactTone(score: number): string {
    if (score >= 85) return 'text-primary';
    if (score >= 75) return 'text-warning';
    return 'text-muted-foreground';
  }

  companyInitials(company: string): string {
    return company
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private loadSignals(): void {
    const skills = this.userSkills().map((skill) => skill.name);
    const jobTitle = this.profile()?.currentJobTitle ?? '';

    this.isSignalsLoading.set(true);
    this.intelligenceService
      .getGlobalSignals(skills, jobTitle)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSignalsLoading.set(false)),
      )
      .subscribe({
        next: (signals) => this.signals.set(signals),
        error: () => {
          this.signals.set([]);
          this.notificationService.error('Could not load Vadis preview signals.', 'Vadis Guidance');
        },
      });
  }

  private loadOpportunities(): void {
    this.isOpportunitiesLoading.set(true);
    this.intelligenceService
      .getCareerOpportunities()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isOpportunitiesLoading.set(false)),
      )
      .subscribe({
        next: (opportunities) => this.opportunities.set(opportunities),
        error: () => {
          this.opportunities.set([]);
          this.notificationService.error('Could not load career opportunities.', 'Vadis Guidance');
        },
      });
  }

  private createApplication(companyId: string, opportunity: CareerOpportunity): void {
    const application: CreateJobApplication = {
      position: opportunity.roleTitle,
      companyId,
      status: JobApplicationStatus.Applied,
      matchScore: opportunity.matchScore,
      description: [
        opportunity.description,
        '',
        'Fit reasons:',
        ...opportunity.fitReasons.map((reason) => `- ${reason}`),
        '',
        `Recommended next action: ${opportunity.nextStep}`,
      ].join('\n'),
    };

    this.applicationService
      .createApplication(application)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingOpportunityId.set(null)),
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            `${opportunity.roleTitle} at ${opportunity.company} was added to Applications.`,
            'Opportunity saved',
          );
        },
        error: () => {
          this.notificationService.error(
            'The application could not be created from this opportunity.',
            'Opportunity not saved',
          );
        },
      });
  }
}
