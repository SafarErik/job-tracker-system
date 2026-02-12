import {
    ChangeDetectionStrategy,
    Component,
    input,
} from '@angular/core';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

export interface FeedItem {
    icon: string;
    label: string;
    time: string;
    type: 'match' | 'status' | 'alert';
}

@Component({
    selector: 'app-activity-feed',
    imports: [...HlmSkeletonImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <article class="bento-card flex h-full flex-col p-5">
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
        Live Activity
      </h2>

      @if (loading()) {
        <div class="flex flex-col gap-3">
          @for (i of skeletonRows; track i) {
            <div class="flex items-center gap-3">
              <div hlmSkeleton class="h-7 w-7 shrink-0 rounded-lg"></div>
              <div class="flex flex-1 flex-col gap-1.5">
                <div hlmSkeleton class="h-3 w-full rounded-md"></div>
                <div hlmSkeleton class="h-2.5 w-16 rounded-md"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="feed-scroll flex flex-1 flex-col gap-1 overflow-y-auto pr-1" role="log" aria-label="Activity feed">
          @for (item of items(); track item.label + item.time) {
            <div
              class="flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/40"
              [class.border-l-2]="item.type === 'alert'"
              [class.border-warning]="item.type === 'alert'"
            >
              <span
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                [class.bg-primary/10]="item.type === 'match'"
                [class.bg-success/10]="item.type === 'status'"
                [class.bg-warning/10]="item.type === 'alert'"
                aria-hidden="true"
              >
                {{ item.icon }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-foreground">{{ item.label }}</p>
                <p class="text-[10px] text-muted-foreground">{{ item.time }}</p>
              </div>
            </div>
          }

          @if (items().length === 0) {
            <div class="flex flex-1 items-center justify-center text-xs text-muted-foreground">
              No recent activity
            </div>
          }
        </div>
      }
    </article>
  `,
    styles: `
    :host { display: block; height: 100%; }

    .feed-scroll {
      max-height: 340px;
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--border)) transparent;
    }

    .feed-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .feed-scroll::-webkit-scrollbar-thumb {
      background: hsl(var(--border));
      border-radius: 2px;
    }
  `,
})
export class ActivityFeedComponent {
    readonly items = input<FeedItem[]>([]);
    readonly loading = input(false);

    readonly skeletonRows = [1, 2, 3, 4, 5];
}
