import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    signal,
} from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

export interface LocationPoint {
    id: string;
    label: string;
    detail: string;
    x: number;
    y: number;
    kind: 'application' | 'opportunity';
    count: number;
}

@Component({
    selector: 'app-global-footprint',
    imports: [...HlmSkeletonImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './global-footprint.component.html',
    styles: `
    :host { display: block; }

    .map-dot {
      box-shadow: 0 0 0 1px hsl(var(--border));
    }

    .map-tooltip {
      pointer-events: none;
      position: absolute;
      transform: translate(-50%, -130%);
      white-space: nowrap;
      border-radius: 0.5rem;
      border: 1px solid hsl(var(--border));
      background: hsl(var(--card));
      padding: 0.375rem 0.625rem;
      font-size: 0.6875rem;
      color: hsl(var(--foreground));
      box-shadow: 0 4px 12px hsl(var(--background) / 0.5);
      z-index: 20;
    }

    @keyframes radar-sweep {
      0% { opacity: 0.15; }
      50% { opacity: 0.35; }
      100% { opacity: 0.15; }
    }

    .radar-pattern {
      background-image:
        radial-gradient(circle at center, hsl(var(--border) / 0.5) 1px, transparent 1px),
        linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px),
        linear-gradient(to bottom, hsl(var(--border) / 0.35) 1px, transparent 1px);
      background-size: 16px 16px, 32px 32px, 32px 32px;
      animation: radar-sweep 4s ease-in-out infinite;
    }
  `,
})
export class GlobalFootprintComponent {
    readonly points = input<LocationPoint[]>([]);
    readonly loading = input(false);

    readonly hoveredPointId = signal<string | null>(null);

    readonly totalLocations = computed(() => this.points().length);

    readonly hoveredPoint = computed(() => {
        const id = this.hoveredPointId();
        if (!id) return null;
        return this.points().find((p) => p.id === id) ?? null;
    });

    onDotEnter(point: LocationPoint): void {
        this.hoveredPointId.set(point.id);
    }

    onDotLeave(): void {
        this.hoveredPointId.set(null);
    }

    trackByPoint(_: number, point: LocationPoint): string {
        return point.id;
    }
}
