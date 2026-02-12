import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MetricCardVariant = 'sparkline' | 'glow' | 'gauge' | 'text';

@Component({
  selector: 'app-metric-card',
  imports: [CommonModule],
  templateUrl: './metric-card.component.html',
  styleUrl: './metric-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  subtitle = input('');
  variant = input<MetricCardVariant>('text');
  sparklinePoints = input('');
  gaugeValue = input(0);
  inactive = input(false);

  readonly safeGaugeValue = computed(() => Math.min(100, Math.max(0, this.gaugeValue())));
}
