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
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { JobApplicationStore } from '../../services/job-application.store';
import { DocumentService } from '../../../documents/services/document.service';
import { DocumentStore } from '../../../documents/services/document.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../companies/services/company.service';
import { JobApplicationStatus } from '../../models/application-status.enum';
import {
  getStatusBadgeClasses,
  getStatusStyle,
  getPriorityBadgeClasses,
} from '../../models/status-styles.util';
import { JobPriorityPipe } from '../../pipes/job-priority.pipe';
import { JobPriority } from '../../models/job-priority.enum';
import { StrategyViewComponent, GapAnalysisItem } from './strategy-view/strategy-view.component';
import { AssetsViewComponent } from './assets-view/assets-view.component';
import { InterviewViewComponent } from './interview-view/interview-view.component';
import { DealViewComponent } from './deal-view/deal-view.component';
import { TimelineViewComponent } from './timeline-view/timeline-view.component';
import { JobSettingsSheetComponent } from './job-settings-sheet/job-settings-sheet.component';
import { UiStateService } from '../../../../core/services/ui-state.service';

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
  lucideSparkles,
  lucideFolderKanban,
  lucideMic2,
  lucideSwords,
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
  lucideArrowRight,
  lucideZap,
  lucideTrash2,
  lucidePlus,
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
  lucideRefreshCw,
  lucideMaximize2,
} from '@ng-icons/lucide';

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
    JobPriorityPipe,
    StrategyViewComponent,
    AssetsViewComponent,
    InterviewViewComponent,
    DealViewComponent,
    TimelineViewComponent,
    JobSettingsSheetComponent,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideFileSearch,
      lucideSparkles,
      lucideFolderKanban,
      lucideMic2,
      lucideSwords,
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
      lucideArrowRight,
      lucideZap,
      lucideTrash2,
      lucidePlus,
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
      lucideRefreshCw,
      lucideMaximize2,
    }),
  ],
  styleUrls: ['./workstation-animations.css'],
  templateUrl: './job-workstation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobWorkstationComponent implements OnInit, OnDestroy {
  public readonly route = inject(ActivatedRoute);
  public readonly uiState = inject(UiStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  public readonly store = inject(JobApplicationStore);
  public readonly service = this.store;
  private readonly documentService = inject(DocumentService);
  private readonly documentStore = inject(DocumentStore);
  private readonly notificationService = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly companyService = inject(CompanyService);

  // Workstation State
  currentPhase = signal<'strategy' | 'assets' | 'interview' | 'deal' | 'timeline'>('strategy');
  isCommandBarOpen = signal(false);
  isPastingManually = signal(false);
  commandBarFocusedIndex = signal(-1); // -1 means no item focused, keyboard nav starts at 0

  // Number of quick action buttons in command bar
  readonly commandBarButtonCount = 3;
  manualPasteText = signal('');
  isFocusMode = signal(false);

  // Command bar input element for programmatic focus
  @ViewChild('commandBarInput') commandBarInput!: ElementRef<HTMLInputElement>;

  // Context-aware Commands
  commands = computed(() => {
    const phase = this.currentPhase();
    if (phase === 'strategy') {
      return [
        {
          id: 'analyze',
          label: 'Refresh analysis',
          icon: 'lucideRotateCw',
          action: () => this.triggerAnalysis(),
        },
        {
          id: 'simulate',
          label: 'Simulate top gap',
          icon: 'lucideZap',
          action: () => {
            const firstGap = this.gapAnalysis().find((g) => !g.matched);
            if (firstGap) this.simulateImprovement(firstGap.name);
          },
        },
      ];
    } else if (phase === 'assets') {
      return [
        {
          id: 'tailor',
          label: 'Generate documents',
          icon: 'lucideSparkles',
          action: () => this.generateAssets(),
        },
      ];
    } else if (phase === 'deal') {
      return [
        {
          id: 'analyze-offer',
          label: 'Analyze offer',
          icon: 'lucideGavel',
          action: () => this.notificationService.info('Analyzing offer terms...', 'Offer'),
        },
      ];
    } else if (phase === 'timeline') {
      return [
        {
          id: 'sync',
          label: 'Sync Calendar',
          icon: 'lucideRefreshCw',
          action: () => this.notificationService.info('Syncing timeline...', 'Timeline'),
        },
        {
          id: 'add-event',
          label: 'Add timeline event',
          icon: 'lucidePlus',
          action: () => this.notificationService.info('Opening timeline event form...', 'Timeline'),
        },
      ];
    } else {
      return [
        {
          id: 'focus',
          label: 'Focus mode',
          icon: 'lucideMaximize2',
          action: () => this.toggleFocusMode(),
        },
      ];
    }
  });

  simulatedScore = signal<number | null>(null);

  // Computed: Highlighted Job Description
  highlightedDescription = computed<string | null>(() => {
    const desc = this.store.selectedApplication()?.description;
    if (!desc) return null;

    const keywords = [
      'Angular',
      'Scalability',
      'TypeScript',
      'Performance',
      'Fintech',
      'Signals',
      'Optimization',
      'Frontend',
      'Distributed Systems',
      'Architecture',
      'UI/UX',
    ];

    // Escape HTML
    let html = desc
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
      .replaceAll('\n', '<br>');

    keywords.forEach((kw) => {
      const regex = new RegExp(`(${kw})`, 'gi');
      html = html.replace(regex, '<span class="keyword-highlight">$1</span>');
    });

    return html;
  });

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
    { id: 'strategy' as const, labelKey: 'workstation.nav.strategy', icon: 'lucideSwords' },
    { id: 'assets' as const, labelKey: 'workstation.nav.assets', icon: 'lucideFolderKanban' },
    { id: 'interview' as const, labelKey: 'workstation.nav.interview', icon: 'lucideMic2' },
    { id: 'deal' as const, labelKey: 'workstation.nav.deal', icon: 'lucideGavel' },
    { id: 'timeline' as const, labelKey: 'workstation.nav.timeline', icon: 'lucideCalendar' },
  ];

  simulateImprovement(skill: string): void {
    const app = this.store.selectedApplication();
    if (app) {
      const currentScore = app.matchScore || 0;
      const newScore = Math.min(100, currentScore + 8);
      this.simulatedScore.set(newScore);
      this.notificationService.info(
        `Simulating ${skill}... Match Score would increase to ${newScore}%`,
        'Simulation Active',
      );

      // Auto-reset after some time
      setTimeout(() => this.simulatedScore.set(null), 5000);
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
    // Clear current application state to free memory (especially large AI responses)
    this.store.clearCurrentApplication();
  }

  // Helpers
  setPhase(phase: 'strategy' | 'assets' | 'interview' | 'deal' | 'timeline'): void {
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
    this.commandBarFocusedIndex.set(-1);
  }

  onCommandBarKeydown(event: KeyboardEvent): void {
    const buttonCount = this.commandBarButtonCount;
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
        this.executeCommandBarAction(currentIndex);
        break;
    }
  }

  executeCommandBarAction(index: number): void {
    switch (index) {
      case 0: // Analyze Job Description
        this.triggerAnalysis();
        this.closeCommandBar();
        break;
      case 1: // Generate Cover Letter
        this.generateAssets();
        this.closeCommandBar();
        break;
      case 2: // Prepare for Interview
        this.toggleCommandBar(); // Close current and switch to interview
        break;
    }
  }

  onAddWorkstationItem(): void {
    this.notificationService.info(
      'Adding new items to the workstation is coming soon.',
      'Feature Preview',
    );
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
    if (status === undefined) return 'Unknown';
    return getStatusStyle(status).label;
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
      if (confirm(`Are you sure you want to delete the application for ${app.companyName}?`)) {
        this.store.deleteApplication(app.id);
        this.goBack();
      }
    }
  }

  /**
   * Trigger AI analysis for the current job application.
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

  // Manual Paste Methods
  startManualPaste(): void {
    const current = this.store.selectedApplication()?.description || '';
    this.isPastingManually.set(true);
    this.manualPasteText.set(current);
  }

  cancelManualPaste(): void {
    this.isPastingManually.set(false);
    this.manualPasteText.set('');
  }

  saveManualPaste(): void {
    const app = this.store.selectedApplication();
    const text = this.manualPasteText().trim();

    if (app && text) {
      this.store.updateApplication(app.id, { description: text });
      this.isPastingManually.set(false);
      this.manualPasteText.set('');
      this.notificationService.success('Job description saved!', 'Job Context');
    }
  }
}
