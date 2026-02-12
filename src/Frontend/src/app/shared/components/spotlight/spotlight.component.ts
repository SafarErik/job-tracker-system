import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';

interface SpotlightAction {
    id: string;
    icon: string;
    label: string;
    description: string;
    route?: string;
    action?: () => void;
}

const ACTIONS: SpotlightAction[] = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', description: 'Career Command Center', route: '/dashboard' },
    { id: 'applications', icon: '📋', label: 'Applications', description: 'Job Application Tracker', route: '/applications' },
    { id: 'companies', icon: '🏢', label: 'Companies', description: 'Company Intelligence', route: '/companies' },
    { id: 'skills', icon: '🎯', label: 'Skills', description: 'Skill Management', route: '/skills' },
    { id: 'statistics', icon: '📈', label: 'Statistics', description: 'Analytics & Insights', route: '/statistics' },
    { id: 'profile', icon: '👤', label: 'Profile', description: 'Your Profile & Resume', route: '/profile' },
];

@Component({
    selector: 'app-spotlight',
    imports: [...HlmButtonImports],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:keydown)': 'onKeyDown($event)',
    },
    template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 flex items-start justify-center bg-background/60 backdrop-blur-sm pt-[15vh]"
        (click)="close()"
        (keydown.escape)="close()"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <!-- Panel -->
        <div
          class="spotlight-panel w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 border-b border-border px-4 py-3">
            <span class="text-muted-foreground" aria-hidden="true">⌘</span>
            <input
              #searchInput
              type="text"
              class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              placeholder="Type a command or search..."
              [value]="query()"
              (input)="onInput($event)"
              (keydown.arrowdown)="onArrowDown($event)"
              (keydown.arrowup)="onArrowUp($event)"
              (keydown.enter)="onEnter()"
              autocomplete="off"
            />
            <kbd class="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

          <!-- Results -->
          <div class="max-h-72 overflow-y-auto py-2" role="listbox">
            @for (action of filteredActions(); track action.id; let i = $index) {
              <button
                type="button"
                class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                [class.bg-accent/50]="i === selectedIndex()"
                [class.text-foreground]="i === selectedIndex()"
                [class.text-muted-foreground]="i !== selectedIndex()"
                (click)="execute(action)"
                (mouseenter)="selectedIndex.set(i)"
                role="option"
                [attr.aria-selected]="i === selectedIndex()"
              >
                <span class="text-base" aria-hidden="true">{{ action.icon }}</span>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ action.label }}</p>
                  <p class="text-xs text-muted-foreground">{{ action.description }}</p>
                </div>
              </button>
            }

            @if (filteredActions().length === 0) {
              <p class="px-4 py-6 text-center text-xs text-muted-foreground">
                No results for "{{ query() }}"
              </p>
            }
          </div>

          <!-- Footer -->
          <div class="flex items-center gap-4 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
              Navigate
            </span>
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
              Open
            </span>
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-border bg-muted px-1 py-0.5 font-mono">esc</kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    }
  `,
    styles: `
    :host { display: contents; }

    .spotlight-panel {
      animation: spotlight-in 0.15s ease-out;
    }

    @keyframes spotlight-in {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(-8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
  `,
})
export class SpotlightComponent {
    private readonly router = inject(Router);

    readonly isOpen = signal(false);
    readonly query = signal('');
    readonly selectedIndex = signal(0);

    readonly filteredActions = computed(() => {
        const q = this.query().toLowerCase().trim();
        if (!q) return ACTIONS;
        return ACTIONS.filter(
            (a) =>
                a.label.toLowerCase().includes(q) ||
                a.description.toLowerCase().includes(q),
        );
    });

    onKeyDown(event: KeyboardEvent): void {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            this.toggle();
        }
    }

    toggle(): void {
        this.isOpen.update((v) => !v);
        if (this.isOpen()) {
            this.query.set('');
            this.selectedIndex.set(0);
        }
    }

    close(): void {
        this.isOpen.set(false);
    }

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.query.set(value);
        this.selectedIndex.set(0);
    }

    onArrowDown(event: Event): void {
        event.preventDefault();
        const max = this.filteredActions().length - 1;
        this.selectedIndex.update((i) => Math.min(i + 1, max));
    }

    onArrowUp(event: Event): void {
        event.preventDefault();
        this.selectedIndex.update((i) => Math.max(i - 1, 0));
    }

    onEnter(): void {
        const actions = this.filteredActions();
        const idx = this.selectedIndex();
        if (actions[idx]) {
            this.execute(actions[idx]);
        }
    }

    execute(action: SpotlightAction): void {
        this.close();
        if (action.route) {
            this.router.navigateByUrl(action.route);
        } else if (action.action) {
            action.action();
        }
    }
}
