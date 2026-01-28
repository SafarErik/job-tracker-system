import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Metric data structure for the dashboard
 */
export interface DashboardMetric {
  label: string;
  value: number | string; // Allow percentage strings
  colorClass: string;     // Specific highlighting color
}

/**
 * Dashboard Metrics Component
 *
 * Displays a row of 7 "Heads-Up" stat cards for quick overview:
 * - Total, Active, Interview, Offers, Rejected, Response %, Success %
 *
 * Design: Premium, minimal, horizontal scrollable row.
 */
@Component({
  selector: 'app-dashboard-metrics',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Horizontal Scroll Container for Responsive Layout -->
    <div class="w-full overflow-x-auto pb-2 -mx-1 px-1">
      <div class="flex gap-4 min-w-max">
        @for (metric of metrics(); track metric.label) {
          <div class="min-w-[140px] flex-1 rounded-2xl p-5 flex flex-col gap-1 transition-all cursor-default"
               [class]="metric.label === 'Active' 
                 ? 'bg-primary text-primary-foreground scale-105 ring-4 ring-primary/10 z-10 border-transparent shadow-xl shadow-primary/20 p-6' 
                 : 'bg-card border border-border/40 text-foreground hover:shadow-md shadow-sm'"
          >
            <!-- Label: Small uppercase tracking -->
            <span class="text-[10px] uppercase tracking-widest font-semibold"
                  [class]="metric.label === 'Active' ? 'text-primary-foreground/80' : 'text-muted-foreground'">
              {{ metric.label }}
            </span>
            <!-- Value: Large bold number -->
            <span
              class="text-3xl font-bold tracking-tight transition-all"
              [class]="metric.label === 'Active' ? 'text-primary-foreground' : metric.colorClass"
            >
              {{ metric.value }}
            </span>
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardMetricsComponent {
  // Inputs using Angular Signals
  total = input<number>(0);
  active = input<number>(0);
  interviews = input<number>(0);
  offers = input<number>(0);
  rejected = input<number>(0);
  responseRate = input<number>(0);
  successRate = input<number>(0);

  // Computed array of metrics for template iteration
  metrics = computed<DashboardMetric[]>(() => [
    {
      label: 'Total',
      value: this.total(),
      colorClass: 'text-foreground',
    },
    {
      label: 'Active',
      value: this.active(),
      colorClass: 'text-primary-foreground',
    },
    {
      label: 'Interview',
      value: this.interviews(),
      colorClass: 'text-violet-500',
    },
    {
      label: 'Offers',
      value: this.offers(),
      colorClass: 'text-amber-500',
    },
    {
      label: 'Rejected',
      value: this.rejected(),
      colorClass: 'text-rose-500',
    },
    {
      label: 'Response',
      value: `${this.responseRate()}%`,
      colorClass: 'text-indigo-500',
    },
    {
      label: 'Success',
      value: `${this.successRate()}%`,
      colorClass: 'text-emerald-500',
    },
  ]);
}
