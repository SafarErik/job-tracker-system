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
  lucideLink,
  lucideLoader2,
  lucideSparkles,
  lucideTarget,
} from '@ng-icons/lucide';
import { JobPriorityPipe } from '../../../pipes/job-priority.pipe';
import { JobTypePipe } from '../../../pipes/job-type.pipe';
import { JobApplication } from '../../../models/job-application.model';

export interface GapAnalysisItem {
  name: string;
  matched: boolean;
  suggestion?: string;
}

@Component({
  selector: 'app-strategy-view',
  imports: [CommonModule, FormsModule, TranslocoPipe, NgIcon, JobPriorityPipe, JobTypePipe],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideBrain,
      lucideCheckCircle2,
      lucideFileText,
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
}
