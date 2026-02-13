import {
    ChangeDetectionStrategy,
    Component,
    input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

export interface PriorityItem {
    id: string;
    position: string;
    company: string;
    kind: 'interview' | 'offer' | 'follow-up';
}

@Component({
    selector: 'app-tactical-priority',
    imports: [CommonModule, ...HlmSkeletonImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <article class="bento-card flex flex-col h-full p-5">
      <header class="mb-4 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground tracking-tight">
          🎯 High Priority
        </h3>
        <span class="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
          {{ items().length }} items
        </span>
      </header>

      @if (loading()) {
        <div class="flex flex-col gap-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="flex items-center gap-3">
              <div hlmSkeleton class="h-4 w-4 shrink-0 rounded"></div>
              <div class="flex-1 space-y-1.5">
                <div hlmSkeleton class="h-3.5 w-36 rounded-sm"></div>
                <div hlmSkeleton class="h-3 w-24 rounded-sm"></div>
              </div>
              <div hlmSkeleton class="h-5 w-14 rounded-full"></div>
            </div>
          }
        </div>
      } @else if (items().length === 0) {
        <div class="flex flex-1 flex-col items-center justify-center gap-2 text-center opacity-60 py-6">
          <span class="text-2xl">✅</span>
          <p class="text-xs text-muted-foreground">All clear — no urgent items</p>
        </div>
      } @else {
        <ul class="flex flex-col gap-2.5 priority-list" role="list" aria-label="High-priority items">
          @for (item of items(); track item.id) {
            <li
              class="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/60"
              role="listitem"
            >
              <!-- Checkbox icon -->
              <span
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-[10px]"
                aria-hidden="true"
              >
                @switch (item.kind) {
                  @case ('interview') { 🎙 }
                  @case ('offer') { 🏆 }
                  @case ('follow-up') { 📬 }
                }
              </span>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-foreground">{{ item.position }}</p>
                <p class="truncate text-[10px] text-muted-foreground">{{ item.company }}</p>
              </div>

              <!-- Badge -->
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                [class.bg-chart-1/15]="item.kind === 'interview'"
                [class.text-chart-1]="item.kind === 'interview'"
                [class.bg-chart-2/15]="item.kind === 'offer'"
                [class.text-chart-2]="item.kind === 'offer'"
                [class.bg-chart-4/15]="item.kind === 'follow-up'"
                [class.text-chart-4]="item.kind === 'follow-up'"
              >
                {{ item.kind }}
              </span>
            </li>
          }
        </ul>
      }
    </article>
  `,
    styles: `
    :host { display: block; }

    .priority-list {
      max-height: 280px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--border)) transparent;
    }

    .priority-list::-webkit-scrollbar { width: 3px; }
    .priority-list::-webkit-scrollbar-thumb {
      background: hsl(var(--border));
      border-radius: 2px;
    }
  `,
})
export class TacticalPriorityComponent {
    readonly items = input<PriorityItem[]>([]);
    readonly loading = input(false);
}
