import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { JobApplicationStore } from '../../services/job-application.store';
import { DocumentStore } from '../../../documents/services/document.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobApplicationStatus } from '../../models/application-status.enum';
import {
  getPriorityBadgeClasses,
  getStatusBadgeClasses,
} from '../../models/status-styles.util';
import { JobPriority } from '../../models/job-priority.enum';
import { StrategyViewComponent, GapAnalysisItem } from './strategy-view/strategy-view.component';
import { AssetsViewComponent } from './assets-view/assets-view.component';
import { InterviewViewComponent } from './interview-view/interview-view.component';
import { DealViewComponent } from './deal-view/deal-view.component';
import { TimelineViewComponent } from './timeline-view/timeline-view.component';
import { JobSettingsSheetComponent } from './job-settings-sheet/job-settings-sheet.component';
import { UiStateService } from '../../../../core/services/ui-state.service';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';
import { FitGap, RefinedJobBrief } from '../../../../core/models/fit-review.model';

// Spartan UI
// ...
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputImports } from '@spartan-ng/helm/input';

// Icons
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideFileSearch,
  lucideFolderKanban,
  lucideMic2,
  lucideCalendar,
  lucideMapPin,
  lucideChevronRight,
  lucideExternalLink,
  lucideClipboardList,
  lucideChevronDown,
  lucideDownload,
  lucideFileText,
  lucideBrain,
  lucideLightbulb,
  lucideTarget,
  lucideLoader2,
  lucideChevronLeft,
  lucideActivity,
  lucideTrash2,
  lucideLinkedin,
  lucideRotateCw,
  lucideArrowLeft,
  lucideCommand,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideLink,
  lucideSettings,
  lucideSearch,
  lucideGavel,
  lucideMaximize2,
  lucideTrendingUp,
} from '@ng-icons/lucide';

type WorkstationPhase = 'strategy' | 'assets' | 'interview' | 'deal' | 'timeline';

export interface WorkstationCommandAction {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  phase?: WorkstationPhase;
  disabled?: () => boolean;
  run: () => void;
}

@Component({
  selector: 'app-job-workstation',
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    TranslocoPipe,
    ReactiveFormsModule,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmSeparatorImports,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmBreadCrumbImports,
    ...HlmDropdownMenuImports,
    HlmDropdownMenuTrigger,
    StrategyViewComponent,
    AssetsViewComponent,
    InterviewViewComponent,
    DealViewComponent,
    TimelineViewComponent,
    JobSettingsSheetComponent,
    ThemeToggleComponent,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideFileSearch,
      lucideFolderKanban,
      lucideMic2,
      lucideCalendar,
      lucideMapPin,
      lucideChevronRight,
      lucideExternalLink,
      lucideClipboardList,
      lucideChevronDown,
      lucideDownload,
      lucideFileText,
      lucideBrain,
      lucideLightbulb,
      lucideTarget,
      lucideLoader2,
      lucideChevronLeft,
      lucideActivity,
      lucideTrash2,
      lucideLinkedin,
      lucideRotateCw,
      lucideArrowLeft,
      lucideCommand,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideLink,
      lucideSettings,
      lucideSearch,
      lucideGavel,
      lucideMaximize2,
      lucideTrendingUp,
    }),
  ],
  styleUrls: ['./workstation-animations.css'],
  templateUrl: './job-workstation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobWorkstationComponent implements OnInit, OnDestroy {
  public readonly route = inject(ActivatedRoute);
  public readonly uiState = inject(UiStateService);
  private readonly location = inject(Location);
  public readonly store = inject(JobApplicationStore);
  public readonly service = this.store;
  private readonly documentStore = inject(DocumentStore);
  private readonly notificationService = inject(NotificationService);
  private readonly transloco = inject(TranslocoService);

  // Workstation State
  currentPhase = signal<WorkstationPhase>('strategy');
  isCommandBarOpen = signal(false);
  isPastingManually = signal(false);
  commandBarFocusedIndex = signal(0);
  commandQuery = signal('');
  manualPasteText = signal('');
  isFocusMode = signal(false);
  timelineAddRequest = signal(0);

  // Command bar input element for programmatic focus
  @ViewChild('commandBarInput') commandBarInput!: ElementRef<HTMLInputElement>;

  simulatedScore = signal<number | null>(null);
  simulatedGap = signal<string | null>(null);
  refinedBriefPreview = signal<RefinedJobBrief | null>(null);
  openReviewRequest = signal(0);

  // Computed: Line Numbers
  lineNumbers = computed(() => {
    const desc = this.store.selectedApplication()?.description;
    if (!desc) return [];
    const lines = desc.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  // Computed: Gap Analysis
  gapAnalysis = computed<GapAnalysisItem[]>(() => {
    const app = this.service.currentJob();
    if (!app) return [];

    const goodPoints = app.aiGoodPoints ?? [];
    const gaps = app.aiGaps ?? [];
    const advice = app.aiAdvice ?? [];

    return [
      ...goodPoints.map((point) => ({ name: point, matched: true }) as GapAnalysisItem),
      ...gaps.map(
        (gap, index) =>
          ({
            name: gap,
            matched: false,
            suggestion: advice[index],
          }) as GapAnalysisItem,
      ),
    ];
  });

  // Expose types for template
  readonly Phase = {
    Strategy: 'strategy' as const,
    Assets: 'assets' as const,
    Interview: 'interview' as const,
    Deal: 'deal' as const,
    Timeline: 'timeline' as const,
  };

  readonly JobStatus = JobApplicationStatus;
  readonly JobPriority = JobPriority;

  // Phase Configuration
  phases = [
    { id: 'strategy' as const, labelKey: 'workstation.nav.strategy', icon: 'lucideTarget' },
    { id: 'assets' as const, labelKey: 'workstation.nav.assets', icon: 'lucideFileText' },
    { id: 'interview' as const, labelKey: 'workstation.nav.interview', icon: 'lucideMic2' },
    { id: 'deal' as const, labelKey: 'workstation.nav.deal', icon: 'lucideGavel' },
    { id: 'timeline' as const, labelKey: 'workstation.nav.timeline', icon: 'lucideCalendar' },
  ];

  readonly commandActions = computed<WorkstationCommandAction[]>(() => [
    {
      id: 'improve-job-brief',
      labelKey: 'workstation.command.actions.improveBrief.label',
      descriptionKey: 'workstation.command.actions.improveBrief.description',
      icon: 'lucideFileText',
      phase: this.Phase.Strategy,
      disabled: () => this.service.isProcessing(),
      run: () => {
        this.setPhase(this.Phase.Strategy);
        this.startManualPaste();
      },
    },
    {
      id: 'analyze-fit',
      labelKey: 'workstation.command.actions.analyzeFit.label',
      descriptionKey: 'workstation.command.actions.analyzeFit.description',
      icon: 'lucideBrain',
      phase: this.Phase.Strategy,
      disabled: () => this.service.isProcessing() || !this.store.selectedApplication()?.description?.trim(),
      run: () => {
        this.setPhase(this.Phase.Strategy);
        this.triggerAnalysis();
      },
    },
    {
      id: 'open-fit-review',
      labelKey: 'workstation.command.actions.openReview.label',
      descriptionKey: 'workstation.command.actions.openReview.description',
      icon: 'lucideMaximize2',
      phase: this.Phase.Strategy,
      disabled: () => !this.store.selectedApplication()?.fitReview,
      run: () => {
        this.setPhase(this.Phase.Strategy);
        this.openReviewRequest.update((value) => value + 1);
      },
    },
    {
      id: 'simulate-top-gap',
      labelKey: 'workstation.command.actions.simulateTopGap.label',
      descriptionKey: 'workstation.command.actions.simulateTopGap.description',
      icon: 'lucideTrendingUp',
      phase: this.Phase.Strategy,
      disabled: () => !this.store.selectedApplication()?.fitReview?.gaps?.length,
      run: () => {
        this.setPhase(this.Phase.Strategy);
        const gap = this.store.selectedApplication()?.fitReview?.gaps?.[0];
        if (gap) this.simulateImprovement(gap);
      },
    },
    {
      id: 'generate-resume',
      labelKey: 'workstation.command.actions.generateResume.label',
      descriptionKey: 'workstation.command.actions.generateResume.description',
      icon: 'lucideFileText',
      phase: this.Phase.Assets,
      disabled: () => this.service.isProcessing(),
      run: () => {
        this.setPhase(this.Phase.Assets);
        this.generateResumeDraft();
      },
    },
    {
      id: 'open-documents',
      labelKey: 'workstation.command.actions.openDocuments.label',
      descriptionKey: 'workstation.command.actions.openDocuments.description',
      icon: 'lucideFileText',
      phase: this.Phase.Assets,
      run: () => this.setPhase(this.Phase.Assets),
    },
    {
      id: 'practice-interview',
      labelKey: 'workstation.command.actions.practiceInterview.label',
      descriptionKey: 'workstation.command.actions.practiceInterview.description',
      icon: 'lucideMic2',
      phase: this.Phase.Interview,
      run: () => this.setPhase(this.Phase.Interview),
    },
    {
      id: 'add-timeline-event',
      labelKey: 'workstation.command.actions.addTimeline.label',
      descriptionKey: 'workstation.command.actions.addTimeline.description',
      icon: 'lucideCalendar',
      phase: this.Phase.Timeline,
      run: () => this.requestTimelineEvent(),
    },
    {
      id: 'edit-role-details',
      labelKey: 'workstation.command.actions.roleDetails.label',
      descriptionKey: 'workstation.command.actions.roleDetails.description',
      icon: 'lucideSettings',
      run: () => this.uiState.openJobSettings(),
    },
  ]);

  readonly filteredCommandActions = computed(() => {
    const query = this.commandQuery().trim().toLowerCase();
    const actions = this.commandActions();
    if (!query) return actions;

    return actions.filter((action) => {
      const label = this.transloco.translate(action.labelKey).toLowerCase();
      const description = this.transloco.translate(action.descriptionKey).toLowerCase();
      return label.includes(query) || description.includes(query);
    });
  });

  simulateImprovement(gap: FitGap | string): void {
    const app = this.store.selectedApplication();
    if (app) {
      const skill = typeof gap === 'string' ? gap : gap.skill;
      const gain = typeof gap === 'string' ? 8 : gap.estimatedScoreGain || 0;
      const currentScore = app.matchScore || 0;
      const newScore = Math.min(100, currentScore + Math.max(1, gain));
      this.simulatedScore.set(newScore);
      this.simulatedGap.set(skill);
      this.notificationService.info(
        this.transloco.translate('workstation.strategy.notifications.simulation.body', {
          skill,
          score: newScore,
        }),
        this.transloco.translate('workstation.strategy.notifications.simulation.title'),
      );

      // Auto-reset after some time
      setTimeout(() => {
        this.simulatedScore.set(null);
        this.simulatedGap.set(null);
      }, 5000);
    }
  }

  toggleFocusMode(): void {
    this.isFocusMode.update((v) => !v);
  }

  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get('id') || this.route.parent?.snapshot.paramMap.get('id');

    // Ensure applications are loaded (handles page refresh)
    if (this.store.applications().length === 0) {
      this.store.loadAll();
    }

    // Ensure documents are loaded (for master resume display)
    if (this.documentStore.documents().length === 0) {
      this.documentStore.loadAll();
    }

    if (id) {
      this.store.selectApplication(id);
    }
  }

  ngOnDestroy(): void {
    // Clear current application state to free memory, especially large review responses.
    this.store.clearCurrentApplication();
  }

  // Helpers
  setPhase(phase: WorkstationPhase): void {
    this.currentPhase.set(phase);
  }

  toggleCommandBar(): void {
    this.isCommandBarOpen.update((v: boolean) => !v);
    // Focus the input when opening the command bar
    if (this.isCommandBarOpen()) {
      setTimeout(() => {
        this.commandBarInput?.nativeElement?.focus();
      }, 0);
    }
  }

  closeCommandBar(): void {
    this.isCommandBarOpen.set(false);
    this.commandBarFocusedIndex.set(0);
    this.commandQuery.set('');
  }

  onCommandBarKeydown(event: KeyboardEvent): void {
    const buttonCount = this.filteredCommandActions().length;
    if (buttonCount === 0) return;

    const currentIndex = this.commandBarFocusedIndex();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.commandBarFocusedIndex.set((currentIndex + 1) % buttonCount);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.commandBarFocusedIndex.set(currentIndex <= 0 ? buttonCount - 1 : currentIndex - 1);
        break;
      case 'Enter':
        event.preventDefault();
        this.executeCommandBarAction(this.filteredCommandActions()[currentIndex]);
        break;
    }
  }

  executeCommandBarAction(action: WorkstationCommandAction | undefined): void {
    if (!action || this.isCommandActionDisabled(action)) return;

    action.run();
    this.closeCommandBar();
  }

  isCommandActionDisabled(action: WorkstationCommandAction): boolean {
    return action.disabled?.() ?? false;
  }

  onCommandQueryChange(query: string): void {
    this.commandQuery.set(query);
    this.commandBarFocusedIndex.set(0);
  }

  requestTimelineEvent(): void {
    this.setPhase(this.Phase.Timeline);
    this.timelineAddRequest.update((value) => value + 1);
  }

  goBack(): void {
    this.location.back();
  }

  getStatusBadgeClasses(status: JobApplicationStatus | undefined): string {
    if (status === undefined)
      return 'bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider';
    return getStatusBadgeClasses(status);
  }

  getPriorityBadgeClasses(priority: JobPriority | undefined): string {
    return getPriorityBadgeClasses(priority);
  }

  getStatusLabel(status: JobApplicationStatus | undefined): string {
    return this.transloco.translate(this.getStatusLabelKey(status));
  }

  getStatusLabelKey(status: JobApplicationStatus | undefined): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'workstation.status.Applied';
      case JobApplicationStatus.PhoneScreen:
        return 'workstation.status.PhoneScreen';
      case JobApplicationStatus.TechnicalTask:
        return 'workstation.status.TechnicalTask';
      case JobApplicationStatus.Interviewing:
        return 'workstation.status.Interviewing';
      case JobApplicationStatus.Offer:
        return 'workstation.status.Offer';
      case JobApplicationStatus.Accepted:
        return 'workstation.status.Accepted';
      case JobApplicationStatus.Rejected:
        return 'workstation.status.Rejected';
      case JobApplicationStatus.Ghosted:
        return 'workstation.status.Ghosted';
      default:
        return 'workstation.status.Unknown';
    }
  }

  getPriorityLabelKey(priority: JobPriority | undefined): string {
    switch (priority) {
      case JobPriority.Low:
        return 'workstation.priority.low';
      case JobPriority.Medium:
        return 'workstation.priority.medium';
      case JobPriority.High:
        return 'workstation.priority.high';
      default:
        return 'workstation.priority.none';
    }
  }

  updateStatus(status: JobApplicationStatus): void {
    const app = this.store.selectedApplication();
    if (app && app.status !== status) {
      this.store.updateApplication(app.id, { status });
    }
  }

  updatePriority(priority: JobPriority): void {
    const app = this.store.selectedApplication();
    if (app && app.priority !== priority) {
      this.store.updateApplication(app.id, { priority });
    }
  }

  deleteApplication(): void {
    const app = this.store.selectedApplication();
    if (app) {
      if (confirm(this.transloco.translate('workstation.roleDetails.deleteConfirm', { company: app.companyName }))) {
        this.store.deleteApplication(app.id);
        this.goBack();
      }
    }
  }

  /**
   * Trigger fit analysis for the current job application.
   * Analyzes the job description against the user's master resume.
   */
  triggerAnalysis(): void {
    const app = this.store.selectedApplication();
    if (app) {
      this.store.analyzeApplication(app.id);
    }
  }

  generateAssets(): void {
    const app = this.store.selectedApplication();
    if (app) {
      this.store.generateAssets(app.id);
    }
  }

  generateResumeDraft(): void {
    const app = this.store.selectedApplication();
    if (app) {
      this.store.generateResumeDraft(app.id).subscribe();
    }
  }

  generateCoverLetterDraft(): void {
    const app = this.store.selectedApplication();
    if (app) {
      this.store.generateCoverLetterDraft(app.id).subscribe();
    }
  }

  // Manual Paste Methods
  startManualPaste(): void {
    const current = this.store.selectedApplication()?.description || '';
    this.isPastingManually.set(true);
    this.manualPasteText.set(current);
    this.refinedBriefPreview.set(null);
  }

  cancelManualPaste(): void {
    this.isPastingManually.set(false);
    this.manualPasteText.set('');
    this.refinedBriefPreview.set(null);
  }

  saveManualPaste(): void {
    const app = this.store.selectedApplication();
    const text = this.manualPasteText().trim();

    if (app && text) {
      this.store.updateApplication(app.id, { description: text });
      this.isPastingManually.set(false);
      this.manualPasteText.set('');
      this.notificationService.success(
        this.transloco.translate('workstation.strategy.notifications.descriptionSaved'),
        this.transloco.translate('workstation.strategy.jobContext'),
      );
    }
  }

  refineBrief(description: string): void {
    const app = this.store.selectedApplication();
    const text = description.trim();
    if (!app || !text) return;

    this.store.refineJobBrief(app.id, text).subscribe((result) => {
      if (result) {
        this.refinedBriefPreview.set(result);
      }
    });
  }

  applyRefinedBrief(description: string): void {
    const app = this.store.selectedApplication();
    const text = description.trim();
    if (!app || !text) return;

    this.store.updateApplication(app.id, { description: text });
    this.isPastingManually.set(false);
    this.manualPasteText.set('');
    this.refinedBriefPreview.set(null);
    this.notificationService.success(
      this.transloco.translate('workstation.strategy.notifications.descriptionSaved'),
      this.transloco.translate('workstation.strategy.jobContext'),
    );
  }
}
