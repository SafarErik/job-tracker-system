import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService, UiStateService } from '../../../../../core/services';

// Services
import { JobApplicationStore } from '../../../services/job-application.store';
import { NotificationService } from '../../../../../core/services/notification.service';

// Models
import { JobApplication } from '../../../models/job-application.model';
import { JobApplicationStatus } from '../../../models/application-status.enum';
import { JobPriority } from '../../../models/job-priority.enum';

// Components
import { ApplicationKanbanComponent } from '../../kanban-board/kanban-board';
import { ApplicationGridComponent } from '../application-grid/application-grid.component';
import { ApplicationListComponent } from '../application-list/application-list.component';
import { ApplicationStatbarComponent } from '../../application-statbar/application-statbar.component';

// Spartan UI
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { provideIcons, NgIcon } from '@ng-icons/core';
import {
  lucideBriefcase,
  lucideDatabaseZap,
  lucideFilter,
  lucideGauge,
  lucideKanban,
  lucideLayoutGrid,
  lucideLayoutList,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSparkles,
  lucideTarget,
} from '@ng-icons/lucide';

type ViewMode = 'grid' | 'kanban' | 'list';
type CategoryId = 'all' | 'inbox' | 'active' | 'offers' | 'archive';
type FocusFilterId = 'all' | 'needsAction' | 'highFit' | 'missingMaterials' | 'stale' | 'archived';

interface FilterItem<T extends string> {
  id: T;
  labelKey: string;
}

interface PipelineInsight {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  actionKey: string;
  metricKey: string;
  metricValue: number;
  icon: string;
}

@Component({
  selector: 'app-job-list',
  imports: [
    CommonModule,
    TranslocoPipe,
    ApplicationGridComponent,
    ApplicationListComponent,
    ApplicationKanbanComponent,
    ApplicationStatbarComponent,
    ...HlmButtonImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideBriefcase,
      lucidePlus,
      lucideDatabaseZap,
      lucideSearch,
      lucideLayoutGrid,
      lucideLayoutList,
      lucideKanban,
      lucideTarget,
      lucideFilter,
      lucideGauge,
      lucideRefreshCw,
      lucideSparkles,
    }),
  ],
  templateUrl: './applications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Dependencies
  public readonly store = inject(JobApplicationStore);
  public readonly uiService = inject(UiStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);

  // Local State
  viewMode = signal<ViewMode>('list');
  selectedCategory = signal<CategoryId>('all');
  focusFilter = signal<FocusFilterId>('all');
  searchQuery = signal<string>('');

  Status = JobApplicationStatus;

  readonly categories: Array<FilterItem<CategoryId>> = [
    { id: 'all', labelKey: 'applications.categories.all' },
    { id: 'inbox', labelKey: 'applications.categories.inbox' },
    { id: 'active', labelKey: 'applications.categories.active' },
    { id: 'offers', labelKey: 'applications.categories.offers' },
    { id: 'archive', labelKey: 'applications.categories.archive' },
  ];

  readonly focusFilters: Array<FilterItem<FocusFilterId>> = [
    { id: 'all', labelKey: 'applications.focusFilters.all' },
    { id: 'needsAction', labelKey: 'applications.focusFilters.needsAction' },
    { id: 'highFit', labelKey: 'applications.focusFilters.highFit' },
    { id: 'missingMaterials', labelKey: 'applications.focusFilters.missingMaterials' },
    { id: 'stale', labelKey: 'applications.focusFilters.stale' },
    { id: 'archived', labelKey: 'applications.focusFilters.archived' },
  ];

  readonly attentionCount = computed(() =>
    this.store.applications().filter((app) => this.needsAction(app)).length,
  );

  readonly highFitCount = computed(() =>
    this.store.applications().filter((app) => (app.matchScore ?? 0) >= 75).length,
  );

  readonly missingMaterialsCount = computed(() =>
    this.store.applications().filter((app) => !app.documentId && !this.isArchived(app)).length,
  );

  readonly staleCount = computed(() =>
    this.store.applications().filter((app) => this.isStale(app)).length,
  );

  readonly archivedCount = computed(() =>
    this.store.applications().filter((app) => this.isArchived(app)).length,
  );

  readonly pipelineInsight = computed<PipelineInsight>(() => {
    const total = this.store.applications().length;
    const metrics = this.store.metrics();

    if (total === 0) {
      return {
        eyebrowKey: 'applications.cockpit.eyebrow.empty',
        titleKey: 'applications.cockpit.empty.title',
        bodyKey: 'applications.cockpit.empty.body',
        actionKey: 'applications.cockpit.empty.action',
        metricKey: 'applications.cockpit.metric.total',
        metricValue: 0,
        icon: 'lucideSparkles',
      };
    }

    if (metrics.offers > 0) {
      return {
        eyebrowKey: 'applications.cockpit.eyebrow.decision',
        titleKey: 'applications.cockpit.offers.title',
        bodyKey: 'applications.cockpit.offers.body',
        actionKey: 'applications.cockpit.offers.action',
        metricKey: 'applications.cockpit.metric.offers',
        metricValue: metrics.offers,
        icon: 'lucideTarget',
      };
    }

    if (this.attentionCount() > 0) {
      return {
        eyebrowKey: 'applications.cockpit.eyebrow.focus',
        titleKey: 'applications.cockpit.attention.title',
        bodyKey: 'applications.cockpit.attention.body',
        actionKey: 'applications.cockpit.attention.action',
        metricKey: 'applications.cockpit.metric.needsAction',
        metricValue: this.attentionCount(),
        icon: 'lucideGauge',
      };
    }

    if (this.highFitCount() > 0) {
      return {
        eyebrowKey: 'applications.cockpit.eyebrow.readiness',
        titleKey: 'applications.cockpit.highFit.title',
        bodyKey: 'applications.cockpit.highFit.body',
        actionKey: 'applications.cockpit.highFit.action',
        metricKey: 'applications.cockpit.metric.highFit',
        metricValue: this.highFitCount(),
        icon: 'lucideTarget',
      };
    }

    return {
      eyebrowKey: 'applications.cockpit.eyebrow.steady',
      titleKey: 'applications.cockpit.steady.title',
      bodyKey: 'applications.cockpit.steady.body',
      actionKey: 'applications.cockpit.steady.action',
      metricKey: 'applications.cockpit.metric.active',
      metricValue: metrics.active,
      icon: 'lucideBriefcase',
    };
  });

  readonly hasApplications = computed(() => this.store.applications().length > 0);

  readonly hasActiveViewFilters = computed(
    () =>
      this.selectedCategory() !== 'all' ||
      this.focusFilter() !== 'all' ||
      this.searchQuery().trim().length > 0,
  );

  filteredApps = computed(() => {
    const apps = this.store.applications();
    const category = this.selectedCategory();
    const focusFilter = this.focusFilter();
    const search = this.searchQuery().trim().toLowerCase();

    let filtered = apps.filter((app) => {
      const matchesSearch =
        !search ||
        [app.position, app.companyName, app.description, app.jobUrl]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search));
      return matchesSearch;
    });

    switch (category) {
      case 'inbox':
        filtered = filtered.filter(app => app.status === JobApplicationStatus.Applied);
        break;
      case 'active':
        filtered = filtered.filter(app => [
          JobApplicationStatus.PhoneScreen,
          JobApplicationStatus.TechnicalTask,
          JobApplicationStatus.Interviewing
        ].includes(app.status));
        break;
      case 'offers':
        filtered = filtered.filter(app => [
          JobApplicationStatus.Offer,
          JobApplicationStatus.Accepted
        ].includes(app.status));
        break;
      case 'archive':
        filtered = filtered.filter(app => [
          JobApplicationStatus.Rejected,
          JobApplicationStatus.Ghosted
        ].includes(app.status));
        break;
      case 'all':
      default:
        break;
    }

    switch (focusFilter) {
      case 'needsAction':
        filtered = filtered.filter((app) => this.needsAction(app));
        break;
      case 'highFit':
        filtered = filtered.filter((app) => (app.matchScore ?? 0) >= 75);
        break;
      case 'missingMaterials':
        filtered = filtered.filter((app) => !app.documentId && !this.isArchived(app));
        break;
      case 'stale':
        filtered = filtered.filter((app) => this.isStale(app));
        break;
      case 'archived':
        filtered = filtered.filter((app) => this.isArchived(app));
        break;
      case 'all':
      default:
        break;
    }

    return [...filtered].sort((left, right) => {
      const priorityDelta = this.getApplicationPriorityScore(right) - this.getApplicationPriorityScore(left);
      if (priorityDelta !== 0) return priorityDelta;
      return new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime();
    });
  });

  ngOnInit(): void {
    this.store.loadAll();
  }

  // Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(_: MouseEvent): void {}

  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // Actions
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.store.setSearchTerm(value); // Keep store in sync if needed
  }

  setCategory(id: CategoryId): void {
    this.selectedCategory.set(id);
  }

  setFocusFilter(id: FocusFilterId): void {
    this.focusFilter.set(id);
  }

  switchView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  isViewActive(mode: ViewMode): boolean {
    return this.viewMode() === mode;
  }

  viewApplicationDetail(id: string): void {
    this.store.selectApplication(id);
    this.router.navigate(['/applications', id]);
  }

  onStatusChange(event: { applicationId: string; status: JobApplicationStatus }): void {
    this.store.updateApplication(event.applicationId, { status: event.status });
  }

  onArchive(id: string): void {
    const app = this.store.applications().find(a => a.id === id);
    if (!app) return;

    const originalStatus = app.status;
    this.store.updateApplication(id, { status: JobApplicationStatus.Rejected });

    this.notificationService.success(
      this.t('applications.notifications.archived.title', {
        company: app.companyName || this.t('common.states.unknown'),
      }),
      this.t('applications.notifications.archived.heading'),
      {
        description: this.t('applications.notifications.archived.body'),
        action: {
          label: this.t('applications.notifications.archived.undo'),
          onClick: () => this.store.updateApplication(id, { status: originalStatus }),
        },
      },
    );
  }

  prioritizePipeline(): void {
    this.viewMode.set('list');
    this.focusFilter.set('needsAction');
    this.selectedCategory.set('all');
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.focusFilter.set('all');
    this.store.setSearchTerm('');
  }

  getFocusFilterCount(id: FocusFilterId): number {
    switch (id) {
      case 'needsAction':
        return this.attentionCount();
      case 'highFit':
        return this.highFitCount();
      case 'missingMaterials':
        return this.missingMaterialsCount();
      case 'stale':
        return this.staleCount();
      case 'archived':
        return this.archivedCount();
      case 'all':
      default:
        return this.store.applications().length;
    }
  }

  private getApplicationPriorityScore(app: JobApplication): number {
    let score = 0;

    if (app.status === JobApplicationStatus.Offer || app.status === JobApplicationStatus.Accepted) score += 120;
    if ([
      JobApplicationStatus.PhoneScreen,
      JobApplicationStatus.TechnicalTask,
      JobApplicationStatus.Interviewing,
    ].includes(app.status)) score += 90;
    if (this.isStale(app)) score += 72;
    if ((app.matchScore ?? 0) >= 75) score += 38;
    if (!app.documentId && !this.isArchived(app)) score += 22;
    if (app.priority === JobPriority.High) score += 18;
    if (this.isArchived(app)) score -= 140;

    return score;
  }

  private needsAction(app: JobApplication): boolean {
    return (
      app.status === JobApplicationStatus.Offer ||
      app.status === JobApplicationStatus.Accepted ||
      app.status === JobApplicationStatus.Interviewing ||
      app.status === JobApplicationStatus.TechnicalTask ||
      app.status === JobApplicationStatus.PhoneScreen ||
      this.isStale(app)
    );
  }

  private isStale(app: JobApplication): boolean {
    return (
      this.getAgeDays(app) >= 7 &&
      (app.status === JobApplicationStatus.Applied || app.status === JobApplicationStatus.PhoneScreen)
    );
  }

  private isArchived(app: JobApplication): boolean {
    return app.status === JobApplicationStatus.Rejected || app.status === JobApplicationStatus.Ghosted;
  }

  private getAgeDays(app: JobApplication): number {
    const appliedAt = new Date(app.appliedAt).getTime();
    if (Number.isNaN(appliedAt)) return 0;
    return Math.max(0, Math.floor((Date.now() - appliedAt) / 86_400_000));
  }

  private t(key: string, params?: Record<string, unknown>): string {
    this.languageService.locale();
    return this.transloco.translate(key, params);
  }
}
