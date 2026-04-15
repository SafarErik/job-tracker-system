import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideBrain,
  lucideCheckCircle2,
  lucideFileText,
  lucideListChecks,
  lucideLink,
  lucideLoader2,
  lucideSparkles,
  lucideTarget,
} from '@ng-icons/lucide';
import { JobApplication } from '../../../models/job-application.model';

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
      lucideFileText,
      lucideListChecks,
      lucideLink,
      lucideLoader2,
      lucideSparkles,
      lucideTarget,
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
  priorityBadgeClass = input.required<string>();

  manualPasteText = model('');

  startManualPaste = output<void>();
  cancelManualPaste = output<void>();
  saveManualPaste = output<void>();
  triggerAnalysis = output<void>();
  simulateImprovement = output<string>();

  readonly descriptionLines = computed(() => {
    const description = this.application()?.description;
    if (!description) return [];
    return description.split('\n');
  });

  readonly jobBrief = computed(() => this.parseJobBrief(this.application()?.description ?? ''));

  readonly matchScore = computed(() => this.simulatedScore() ?? this.application()?.matchScore ?? 0);

  readonly matchScoreLabelKey = computed(() => {
    const score = this.matchScore();
    if (score >= 80) return 'workstation.strategy.score.strong';
    if (score >= 55) return 'workstation.strategy.score.workable';
    if (score > 0) return 'workstation.strategy.score.needsWork';
    return 'workstation.strategy.score.notAnalyzed';
  });

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
