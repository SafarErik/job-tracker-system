import { ChangeDetectionStrategy, Component, computed, effect, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideBrain,
  lucideCheckCircle2,
  lucideClipboard,
  lucideFileText,
  lucideGraduationCap,
  lucideListChecks,
  lucideLink,
  lucideLoader2,
  lucideMaximize2,
  lucideMic2,
  lucideSparkles,
  lucideTarget,
  lucideWand2,
  lucideX,
} from '@ng-icons/lucide';
import { JobApplication } from '../../../models/job-application.model';
import {
  FitGap,
  FitKeySignal,
  RefinedJobBrief,
  RoleBrief,
} from '../../../../../core/models/fit-review.model';

export interface GapAnalysisItem {
  name: string;
  matched: boolean;
  suggestion?: string;
}

export interface ParsedJobBrief {
  overview: string[];
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
}

@Component({
  selector: 'app-strategy-view',
  imports: [CommonModule, FormsModule, TranslocoPipe, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideBrain,
      lucideCheckCircle2,
      lucideClipboard,
      lucideFileText,
      lucideGraduationCap,
      lucideListChecks,
      lucideLink,
      lucideLoader2,
      lucideMaximize2,
      lucideMic2,
      lucideSparkles,
      lucideTarget,
      lucideWand2,
      lucideX,
    }),
  ],
  templateUrl: './strategy-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrategyViewComponent {
  application = input<JobApplication | null>(null);
  lineNumbers = input.required<number[]>();
  isPastingManually = input(false);
  isProcessing = input(false);
  gapAnalysis = input.required<GapAnalysisItem[]>();
  simulatedScore = input<number | null>(null);
  simulatedGap = input<string | null>(null);
  priorityBadgeClass = input.required<string>();
  refinedBriefPreview = input<RefinedJobBrief | null>(null);
  isRefiningBrief = input(false);
  openReviewRequest = input(0);

  manualPasteText = model('');
  isReviewExpanded = signal(false);
  copiedReview = signal(false);

  startManualPaste = output<void>();
  cancelManualPaste = output<void>();
  saveManualPaste = output<void>();
  refineBrief = output<string>();
  applyRefinedBrief = output<string>();
  clearRefinedBrief = output<void>();
  triggerAnalysis = output<void>();
  simulateImprovement = output<FitGap | string>();
  openAssets = output<void>();
  openInterview = output<void>();
  addLearningCheckpoint = output<void>();

  constructor() {
    effect(() => {
      if (this.openReviewRequest() > 0 && this.application()?.fitReview) {
        this.isReviewExpanded.set(true);
      }
    });
  }

  readonly descriptionLines = computed(() => {
    const description = this.application()?.description;
    if (!description) return [];
    return description.split('\n');
  });

  readonly fitReview = computed(() => this.application()?.fitReview ?? null);

  readonly expandedReview = computed(() => (this.isReviewExpanded() ? this.fitReview() : null));

  readonly jobBrief = computed<RoleBrief>(() => {
    const reviewBrief = this.fitReview()?.roleBrief;
    if (reviewBrief) return reviewBrief;
    return this.parseJobBrief(this.application()?.description ?? '');
  });

  readonly matchScore = computed(() => this.simulatedScore() ?? this.fitReview()?.matchScore ?? this.application()?.matchScore ?? 0);

  readonly keySignals = computed<FitKeySignal[]>(() => this.fitReview()?.keySignals ?? []);

  readonly reviewGaps = computed<FitGap[]>(() => this.fitReview()?.gaps ?? []);

  readonly hasReview = computed(() => !!this.fitReview());

  readonly topGaps = computed(() => this.reviewGaps().slice(0, 3));

  readonly topNextActions = computed(() => this.fitReview()?.nextActions?.slice(0, 4) ?? []);

  readonly matchScoreLabelKey = computed(() => {
    const score = this.matchScore();
    if (score >= 80) return 'workstation.strategy.score.strong';
    if (score >= 55) return 'workstation.strategy.score.workable';
    if (score > 0) return 'workstation.strategy.score.needsWork';
    return 'workstation.strategy.score.notAnalyzed';
  });

  openReview(): void {
    if (this.fitReview()) this.isReviewExpanded.set(true);
  }

  closeReview(): void {
    this.isReviewExpanded.set(false);
  }

  requestBriefRefinement(): void {
    const text = this.manualPasteText().trim();
    if (text) this.refineBrief.emit(text);
  }

  applyPreview(): void {
    const preview = this.refinedBriefPreview();
    if (preview?.description) this.applyRefinedBrief.emit(preview.description);
  }

  async copyReview(): Promise<void> {
    const text = this.fitReview()?.fullReviewMarkdown?.trim();
    if (!text) return;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    this.copiedReview.set(true);
    setTimeout(() => this.copiedReview.set(false), 1800);
  }

  signalClasses(signal: FitKeySignal): string {
    if (signal.type === 'strength') return 'border-primary/20 bg-primary/5 text-primary';
    if (signal.type === 'risk') return 'border-destructive/20 bg-destructive/5 text-destructive';
    return 'border-border bg-background text-muted-foreground';
  }

  gapPriorityClasses(priority: string): string {
    if (priority === 'high') return 'border-destructive/20 bg-destructive/10 text-destructive';
    if (priority === 'low') return 'border-muted bg-muted text-muted-foreground';
    return 'border-primary/20 bg-primary/10 text-primary';
  }

  private parseJobBrief(description: string): ParsedJobBrief {
    const lines = description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const overview: string[] = [];
    const responsibilities: string[] = [];
    const requirements: string[] = [];
    let current: 'overview' | 'responsibilities' | 'requirements' = 'overview';

    for (const line of lines) {
      const normalized = line.toLowerCase().replace(/:$/, '');

      if (/responsibilit|feladat|what you'll do|duties/.test(normalized)) {
        current = 'responsibilities';
        continue;
      }

      if (/requirement|qualification|skill|must have/.test(normalized)) {
        current = 'requirements';
        continue;
      }

      const cleanLine = line.replace(/^[-*\u2022]\s*/, '').trim();
      if (!cleanLine) continue;

      if (current === 'responsibilities') {
        responsibilities.push(cleanLine);
      } else if (current === 'requirements') {
        requirements.push(cleanLine);
      } else {
        overview.push(cleanLine);
      }
    }

    const appSkills = this.application()?.skills ?? [];
    const keywordSource = [...appSkills, ...lines.join(' ').split(/[,.;()\s/]+/)]
      .map((word) => word.trim())
      .filter((word) => word.length > 3 && /^[a-zA-Z0-9+#.-]+$/.test(word));

    return {
      overview: overview.slice(0, 3),
      responsibilities: responsibilities.slice(0, 6),
      requirements: requirements.slice(0, 6),
      keywords: Array.from(new Set(keywordSource)).slice(0, 10),
    };
  }
}
