import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

export type StatCardVariant = 'default' | 'glow' | 'highlight';

@Component({
    selector: 'app-stat-card',
    imports: [...HlmSkeletonImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (loading()) {
      <article class="bento-card flex flex-col gap-3 p-5" [class]="variantClasses()">
        <div hlmSkeleton class="h-3 w-20 rounded-md"></div>
        <div hlmSkeleton class="h-8 w-16 rounded-md"></div>
        <div class="flex items-center gap-2">
          <div hlmSkeleton class="h-3 w-10 rounded-md"></div>
          <div hlmSkeleton class="h-3 w-24 rounded-md"></div>
        </div>
      </article>
    } @else {
      <article class="bento-card flex flex-col justify-between gap-2 p-5" [class]="variantClasses()">
        <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {{ label() }}
        </p>

        <p
          class="text-3xl font-semibold text-foreground"
          style="font-family: var(--font-sans); font-variant-numeric: tabular-nums"
        >
          {{ value() }}
        </p>

        <div class="flex items-center gap-2 text-xs">
          @if (trend()) {
            <span class="font-medium text-success">{{ trend() }}</span>
          }
          @if (subtitle()) {
            <span class="text-muted-foreground">{{ subtitle() }}</span>
          }
        </div>
      </article>
    }
  `,
    styles: `
    :host {
      display: block;
    }

    .bento-card {
      border-radius: 1.5rem;
      border: 1px solid hsl(var(--border));
      background: hsl(var(--card) / 0.4);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .bento-card:hover {
      border-color: hsl(var(--primary) / 0.3);
    }

    .variant-glow {
      box-shadow: 0 0 24px hsl(var(--primary) / 0.1);
    }

    .variant-highlight {
      border-left: 4px solid hsl(var(--success));
    }
  `,
})
export class StatCardComponent {
    readonly label = input.required<string>();
    readonly value = input.required<string | number>();
    readonly subtitle = input('');
    readonly trend = input('');
    readonly variant = input<StatCardVariant>('default');
    readonly loading = input(false);

    readonly variantClasses = computed(() => {
        switch (this.variant()) {
            case 'glow':
                return 'variant-glow';
            case 'highlight':
                return 'variant-highlight';
            default:
                return '';
        }
    });
}
