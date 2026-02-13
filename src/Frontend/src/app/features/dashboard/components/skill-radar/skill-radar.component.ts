import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmButtonImports } from '@spartan-ng/helm/button';

export interface SkillRadarAxis {
  label: string;
  userScore: number;
  marketScore: number;
}

/** Default axes when no data is provided. */
const DEFAULT_AXES: SkillRadarAxis[] = [
  { label: 'Frontend', userScore: 0, marketScore: 70 },
  { label: 'Backend', userScore: 0, marketScore: 80 },
  { label: 'DevOps', userScore: 0, marketScore: 60 },
  { label: 'Soft Skills', userScore: 0, marketScore: 50 },
  { label: 'Product', userScore: 0, marketScore: 40 },
];

const CX = 150;
const CY = 140;
const RADIUS = 100;

@Component({
  selector: 'app-skill-radar',
  imports: [...HlmSkeletonImports, ...HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="bento-card flex h-full flex-col p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
          Skill Radar
        </h2>
        <span class="text-xs text-muted-foreground">You vs Market</span>
      </div>

      @if (loading()) {
        <div class="flex flex-1 items-center justify-center">
          <div hlmSkeleton class="h-48 w-48 rounded-full"></div>
        </div>
      } @else {
        <div class="flex flex-1 flex-col items-center justify-center">
          <svg
            [attr.viewBox]="'0 0 300 280'"
            class="w-full max-w-xs"
            role="img"
            aria-label="Skill radar chart comparing your skills to market demand"
          >
            <!-- Grid rings -->
            @for (ring of gridRings; track ring) {
              <polygon
                [attr.points]="ringPoints(ring)"
                fill="none"
                stroke="hsl(var(--border))"
                stroke-width="1"
                [attr.opacity]="0.4"
              />
            }

            <!-- Axis lines -->
            @for (pt of axisEndpoints(); track $index) {
              <line
                [attr.x1]="cx"
                [attr.y1]="cy"
                [attr.x2]="pt.x"
                [attr.y2]="pt.y"
                stroke="hsl(var(--border))"
                stroke-width="1"
                opacity="0.3"
              />
            }

            <!-- Market demand polygon (gray outline) -->
            <polygon
              [attr.points]="marketPolygon()"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              stroke-width="1.5"
              stroke-dasharray="4 3"
              opacity="0.5"
            />

            <!-- User score polygon (violet fill) -->
            <polygon
              [attr.points]="userPolygon()"
              fill="hsl(var(--primary) / 0.15)"
              stroke="hsl(var(--primary))"
              stroke-width="2"
              class="transition-all duration-500 ease-out"
            />

            <!-- User score dots -->
            @for (pt of userPoints(); track $index) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                r="4"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                stroke-width="2"
              />
            }

            <!-- Axis labels -->
            @for (lbl of axisLabels(); track $index) {
              <text
                [attr.x]="lbl.x"
                [attr.y]="lbl.y"
                [attr.text-anchor]="lbl.anchor"
                class="fill-muted-foreground"
                style="font-size: 11px;"
              >
                {{ lbl.text }}
              </text>
            }
          </svg>

          <!-- Legend -->
          <div class="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span class="flex items-center gap-1.5">
              <span class="inline-block h-2.5 w-2.5 rounded-full bg-primary"></span>
              Your Skills
            </span>
            <span class="flex items-center gap-1.5">
              <span
                class="inline-block h-2.5 w-2.5 rounded-full border border-muted-foreground"
              ></span>
              Market Demand
            </span>
          </div>

          @if (needsCalibration()) {
            <button hlmBtn size="sm" variant="outline" class="mt-3 text-xs">
              Calibrate Skills
            </button>
          }
        </div>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SkillRadarComponent {
  readonly axes = input<SkillRadarAxis[]>(DEFAULT_AXES);
  readonly loading = input(false);

  readonly cx = CX;
  readonly cy = CY;
  readonly gridRings = [0.25, 0.5, 0.75, 1.0];

  readonly needsCalibration = computed(() => this.axes().every((a) => a.userScore === 0));

  readonly axisEndpoints = computed(() => this.axes().map((_, i) => this.polarToCartesian(i, 1)));

  readonly axisLabels = computed(() =>
    this.axes().map((axis, i) => {
      const pt = this.polarToCartesian(i, 1.22);
      const center = 0; // Center is 0 since coordinates are centered
      let anchor = 'middle';
      if (pt.x > center) anchor = 'start';
      if (pt.x < center) anchor = 'end';
      return { x: pt.x, y: pt.y + 4, text: axis.label, anchor };
    }),
  );

  readonly userPolygon = computed(() =>
    this.axes()
      .map((a, i) => {
        const pt = this.polarToCartesian(i, a.userScore / 100);
        return `${pt.x},${pt.y}`;
      })
      .join(' '),
  );

  readonly userPoints = computed(() =>
    this.axes().map((a, i) => this.polarToCartesian(i, a.userScore / 100)),
  );

  readonly marketPolygon = computed(() =>
    this.axes()
      .map((a, i) => {
        const pt = this.polarToCartesian(i, a.marketScore / 100);
        return `${pt.x},${pt.y}`;
      })
      .join(' '),
  );

  ringPoints(fraction: number): string {
    return this.axes()
      .map((_, i) => {
        const pt = this.polarToCartesian(i, fraction);
        return `${pt.x},${pt.y}`;
      })
      .join(' ');
  }

  private angleForIndex(index: number): number {
    const count = this.axes().length;
    return (360 / count) * index - 90;
  }

  private polarToCartesian(index: number, fraction: number): { x: number; y: number } {
    const angleDeg = this.angleForIndex(index);
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: CX + RADIUS * fraction * Math.cos(angleRad),
      y: CY + RADIUS * fraction * Math.sin(angleRad),
    };
  }
}
