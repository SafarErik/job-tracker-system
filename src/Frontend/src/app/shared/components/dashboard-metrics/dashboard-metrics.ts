import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Metric data structure for the dashboard
 */
export interface DashboardMetric {
  label: string;
  value: number | string; // Allow percentage strings
  colorClass: string;     // Specific highlighting color
  indicatorColorClass: string; // Thick left border color for standard cards
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
          @if (metric.label === 'Active') {
            <!-- PREMIUM ACTIVE CARD (Premium Gradient) -->
            <div class="relative overflow-hidden min-w-[160px] flex-1 rounded-2xl bg-gradient-to-br from-[#6D5DF6] to-[#5b4ddb] p-5 text-white shadow-lg shadow-primary/20 ring-1 ring-white/10 transition-all scale-105 z-10">
              
              <!-- Subtle decoration circle in background -->
              <div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

              <div class="relative z-10 flex flex-col gap-1">
                <span class="text-xs font-bold uppercase tracking-widest text-white/70">
                  Active
                </span>
                <span class="text-4xl font-bold tracking-tight text-white">
                  {{ metric.value }}
                </span>
              </div>
            </div>
          } @else {
            <!-- STANDARD METRIC CARD WITH INDICATOR STRIPE -->
            <div 
              class="relative overflow-hidden min-w-[140px] flex-1 rounded-2xl p-5 flex flex-col gap-1 transition-all cursor-default bg-card border border-border/30 text-foreground hover:shadow-md shadow-sm border-l-4"
              [class]="metric.indicatorColorClass"
            >
              <!-- Label: Small uppercase tracking -->
              <span class="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                {{ metric.label }}
              </span>
              <!-- Value: Large bold number -->
              <span class="text-3xl font-bold tracking-tight transition-all" [class]="metric.colorClass">
                {{ metric.value }}
              </span>
            </div>
          }
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
      indicatorColorClass: 'border-l-slate-400'
    },
    {
      label: 'Active',
      value: this.active(),
      colorClass: 'text-primary-foreground',
      indicatorColorClass: 'border-l-primary/20'
    },
    {
      label: 'Interview',
      value: this.interviews(),
      colorClass: 'text-violet-500',
      indicatorColorClass: 'border-l-violet-500'
    },
    {
      label: 'Offers',
      value: this.offers(),
      colorClass: 'text-amber-500',
      indicatorColorClass: 'border-l-amber-500'
    },
    {
      label: 'Rejected',
      value: this.rejected(),
      colorClass: 'text-rose-500',
      indicatorColorClass: 'border-l-rose-500'
    },
    {
      label: 'Response',
      value: `${this.responseRate()}%`,
      colorClass: 'text-indigo-500',
      indicatorColorClass: 'border-l-indigo-500'
    },
    {
      label: 'Success',
      value: `${this.successRate()}%`,
      colorClass: 'text-emerald-500',
      indicatorColorClass: 'border-l-emerald-500'
    },
  ]);
}
