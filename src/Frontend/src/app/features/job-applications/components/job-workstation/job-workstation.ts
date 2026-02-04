import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { JobApplicationStore } from '../../services/job-application.store';
import { DocumentService } from '../../../documents/services/document.service';
import { DocumentStore } from '../../../documents/services/document.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../companies/services/company.service';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { getStatusBadgeClasses, getStatusStyle, getPriorityBadgeClasses } from '../../models/status-styles.util';
import { JobPriorityPipe } from '../../pipes/job-priority.pipe';
import { JobTypePipe } from '../../pipes/job-type.pipe';
import { JobPriority } from '../../models/job-priority.enum';
import { AssetsViewComponent } from './assets-view/assets-view.component';
import { InterviewViewComponent } from './interview-view/interview-view.component';
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
  lucideSearch
} from '@ng-icons/lucide';

interface GapAnalysisItem {
  name: string;
  matched: boolean;
  suggestion?: string;
}

@Component({
  selector: 'app-job-workstation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
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
    JobTypePipe,
    AssetsViewComponent,
    InterviewViewComponent,
    JobSettingsSheetComponent
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
      lucideSearch
    })
  ],
  styleUrls: ['./workstation-animations.css'],
  templateUrl: './job-workstation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobWorkstationComponent implements OnInit {
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
  currentPhase = signal<'strategy' | 'assets' | 'interview'>('strategy');
  isCommandBarOpen = signal(false);
  isPastingManually = signal(false);
  manualPasteText = signal('');

  // Computed: Highlighted Job Description
  highlightedDescription = computed<string | null>(() => {
    const desc = this.store.selectedApplication()?.description;
    if (!desc) return null;

    const keywords = ['Angular', 'Scalability', 'TypeScript', 'Performance', 'Fintech', 'Signals', 'Optimization', 'Frontend', 'Distributed Systems'];

    // Escape HTML to prevent XSS before adding our own spans
    let escaped = desc
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

    let html = escaped.replaceAll('\n', '<br>');

    keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      html = html.replace(regex, '<span class="bg-primary/20 text-primary px-1 rounded">$1</span>');
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
      ...goodPoints.map(point => ({ name: point, matched: true } as GapAnalysisItem)),
      ...gaps.map((gap, index) => ({
        name: gap,
        matched: false,
        suggestion: advice[index]
      } as GapAnalysisItem))
    ];
  });

  // Expose types for template
  readonly Phase = {
    Strategy: 'strategy' as const,
    Assets: 'assets' as const,
    Interview: 'interview' as const
  };

  readonly JobStatus = JobApplicationStatus;
  readonly JobPriority = JobPriority;

  // Phase Configuration
  phases = [
    { id: 'strategy' as const, label: 'Strategy', icon: 'lucideSwords' },
    { id: 'assets' as const, label: 'Assets', icon: 'lucideFolderKanban' },
    { id: 'interview' as const, label: 'Interview', icon: 'lucideMic2' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ||
      this.route.parent?.snapshot.paramMap.get('id');

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

  // Helpers
  setPhase(phase: 'strategy' | 'assets' | 'interview'): void {
    this.currentPhase.set(phase);
  }

  toggleCommandBar(): void {
    this.isCommandBarOpen.update(v => !v);
  }

  closeCommandBar(): void {
    this.isCommandBarOpen.set(false);
  }

  onAddWorkstationItem(): void {
    this.notificationService.info('Adding new items to the workstation is coming soon.', 'Feature Preview');
  }

  goBack(): void {
    this.location.back();
  }

  getStatusBadgeClasses(status: JobApplicationStatus | undefined): string {
    if (status === undefined) return 'bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider';
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
