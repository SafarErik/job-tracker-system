import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PipelineStage {
  label: string;
  count: number;
}

@Component({
  selector: 'app-pipeline-chart',
  imports: [CommonModule],
  templateUrl: './pipeline-chart.component.html',
  styleUrl: './pipeline-chart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PipelineChartComponent {
  stages = input.required<PipelineStage[]>();

  readonly maxCount = computed(() => Math.max(...this.stages().map((stage) => stage.count), 1));
  readonly hasData = computed(() => this.stages().some((stage) => stage.count > 0));

  barWidth(count: number): number {
    return (count / this.maxCount()) * 100;
  }
}
