import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
    selector: 'app-momentum-gauge',
    imports: [...HlmSkeletonImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (loading()) {
      <div class="flex flex-col items-center gap-2">
        <div hlmSkeleton class="h-28 w-28 rounded-full"></div>
        <div hlmSkeleton class="h-4 w-20 rounded-md"></div>
      </div>
    } @else {
      <div class="flex flex-col items-center" role="meter" [attr.aria-valuenow]="clampedScore()" aria-valuemin="0" aria-valuemax="100" aria-label="Career Momentum">
        <svg viewBox="0 0 120 70" class="h-28 w-28" aria-hidden="true">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" [attr.stop-color]="'hsl(var(--primary))'" />
              <stop offset="100%" [attr.stop-color]="'hsl(var(--success))'" />
            </linearGradient>
          </defs>

          <!-- Background arc -->
          <path
            [attr.d]="arcPath()"
            fill="none"
            stroke="hsl(var(--muted))"
            stroke-width="10"
            stroke-linecap="round"
          />

          <!-- Value arc -->
          <path
            [attr.d]="arcPath()"
            fill="none"
            stroke="url(#gaugeGrad)"
            stroke-width="10"
            stroke-linecap="round"
            [attr.stroke-dasharray]="arcLength()"
            [attr.stroke-dashoffset]="dashOffset()"
            class="transition-all duration-700 ease-out"
          />

          <!-- Score text -->
          <text
            x="60" y="55"
            text-anchor="middle"
            class="fill-foreground text-2xl font-semibold"
            style="font-family: 'Geist Mono', 'Inter', monospace; font-size: 22px;"
          >
            {{ clampedScore() }}
          </text>
        </svg>

        <span class="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Momentum
        </span>
      </div>
    }
  `,
})
export class MomentumGaugeComponent {
    readonly score = input(0);
    readonly loading = input(false);

    readonly clampedScore = computed(() => Math.min(100, Math.max(0, this.score())));

    /**
     * Semi-circle arc path (180 degrees, from left to right).
     * Center at (60, 55), radius 45.
     */
    readonly arcPath = computed(() => {
        const cx = 60;
        const cy = 55;
        const r = 45;
        const startX = cx - r;
        const endX = cx + r;
        return `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;
    });

    /** Total length of the semi-circle arc (π * r). */
    readonly arcLength = computed(() => {
        const r = 45;
        return Math.PI * r;
    });

    /** Dash offset to reveal only the scored portion of the arc. */
    readonly dashOffset = computed(() => {
        const total = this.arcLength();
        const fraction = this.clampedScore() / 100;
        return total * (1 - fraction);
    });
}
