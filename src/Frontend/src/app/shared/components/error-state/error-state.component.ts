import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWifiOff, lucideRefreshCcw } from '@ng-icons/lucide';

@Component({
  selector: 'app-error-state',
  imports: [CommonModule, HlmButtonImports, NgIcon],
  providers: [provideIcons({ lucideWifiOff, lucideRefreshCcw })],
  template: `
    <div class="flex min-h-[320px] w-full flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/[0.02] p-10 text-center animate-in fade-in zoom-in-95 duration-300">
      <div class="relative mb-6">
        <div class="relative flex h-16 w-16 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 text-destructive">
          <ng-icon [name]="icon()" class="text-4xl stroke-[1.5]"></ng-icon>
        </div>
      </div>

      <div class="space-y-2 mb-8">
        <h2 class="text-2xl font-bold tracking-tight text-foreground">{{ title() }}</h2>
        <p class="text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {{ message() }}
        </p>
      </div>

      <button (click)="retry.emit()"
              hlmBtn
              variant="outline"
              class="h-10 gap-2 rounded-lg border-border px-6 transition-all hover:bg-muted hover:text-foreground group">
        <ng-icon name="lucideRefreshCcw" class="text-base group-active:rotate-180 transition-transform duration-500"></ng-icon>
        Try again
      </button>
    </div>
  `
})
export class ErrorStateComponent {
  title = input<string>('Could not load this view');
  message = input<string>('We are having trouble reaching the workspace. Check your connection and try again.');
  icon = input<string>('lucideWifiOff');
  retry = output<void>();
}
