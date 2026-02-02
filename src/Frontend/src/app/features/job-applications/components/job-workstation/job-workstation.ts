import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { JobApplicationStore } from '../../services/job-application.store';
import { DocumentService } from '../../../documents/services/document.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../companies/services/company.service';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { getStatusStyle } from '../../models/status-styles.util';
import { JobPriorityPipe } from '../../pipes/job-priority.pipe';
import { JobTypePipe } from '../../pipes/job-type.pipe';
import { AssetsViewComponent } from './assets-view/assets-view.component';
import { InterviewViewComponent } from './interview-view/interview-view.component';

// Spartan UI
// ...
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
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
  lucideLink
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
    JobPriorityPipe,
    JobTypePipe,
    AssetsViewComponent,
    InterviewViewComponent
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
      lucideLink
    })
  ],
  styleUrls: ['./workstation-animations.css'],
  templateUrl: './job-workstation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobWorkstationComponent implements OnInit {
  public readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  public readonly store = inject(JobApplicationStore);
  private readonly documentService = inject(DocumentService);
  private readonly notificationService = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly companyService = inject(CompanyService);

  // Workstation State
  currentPhase = signal<'strategy' | 'assets' | 'interview'>('strategy');
  isCommandBarOpen = signal(false);

  private readonly sanitizer = inject(DomSanitizer);

  // Computed: Highlighted Job Description
  highlightedDescription = computed<SafeHtml | null>(() => {
    const desc = this.store.selectedApplication()?.jobDescription;
    if (!desc) return null;

    const keywords = ['Angular', 'Scalability', 'TypeScript', 'Performance', 'Fintech', 'Signals', 'Optimization', 'Frontend', 'Distributed Systems'];

    let html = desc.replace(/\n/g, '<br>');

    keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      html = html.replace(regex, '<span class="bg-violet-500/20 text-violet-300 px-1 rounded">$1</span>');
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  // Computed: Line Numbers
  lineNumbers = computed(() => {
    const desc = this.store.selectedApplication()?.jobDescription;
    if (!desc) return [];
    const lines = desc.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  // Computed: Gap Analysis
  gapAnalysis = computed<GapAnalysisItem[]>(() => {
    const app = this.store.selectedApplication();
    if (!app) return [];

    const matchedSkills = app.skills || [];
    // For demo purposes, we'll suggest some missing skills if the list is short
    const commonTech = ['Unit Testing', 'AWS', 'Docker', 'GraphQL', 'CI/CD'];
    const missing = commonTech.filter(s => !matchedSkills.includes(s)).slice(0, 2);

    return [
      ...matchedSkills.map(s => ({ name: s, matched: true } as GapAnalysisItem)),
      ...missing.map(s => ({
        name: s,
        matched: false,
        suggestion: `Consider adding ${s} projects to your portfolio.`
      } as GapAnalysisItem))
    ];
  });

  // Expose types for template
  readonly Phase = {
    Strategy: 'strategy' as const,
    Assets: 'assets' as const,
    Interview: 'interview' as const
  };

  // Phase Configuration
  phases = [
    { id: 'strategy' as const, label: 'Strategy', icon: 'lucideSwords' },
    { id: 'assets' as const, label: 'Assets', icon: 'lucideFolderKanban' },
    { id: 'interview' as const, label: 'Interview', icon: 'lucideMic2' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ||
      this.route.parent?.snapshot.paramMap.get('id');

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

  goBack(): void {
    this.location.back();
  }

  getStatusBadgeClasses(status: JobApplicationStatus | undefined): string {
    if (!status) return 'bg-zinc-800 text-zinc-400';
    switch (status) {
      case JobApplicationStatus.Interviewing:
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
      case JobApplicationStatus.Offer:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border border-zinc-700';
    }
  }

  getStatusLabel(status: JobApplicationStatus | undefined): string {
    if (status === undefined) return 'Unknown';
    return getStatusStyle(status).label;
  }
}
