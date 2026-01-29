import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideWifiOff, lucideRefreshCcw } from '@ng-icons/lucide';

@Component({
    selector: 'app-error-state',
    standalone: true,
    imports: [CommonModule, HlmButtonImports, NgIcon],
    providers: [provideIcons({ lucideWifiOff, lucideRefreshCcw })],
    template: `
    <div class="flex flex-col items-center justify-center min-h-[400px] w-full rounded-[2rem] border border-destructive/20 bg-destructive/[0.02] backdrop-blur-sm p-12 text-center animate-in fade-in zoom-in-95 duration-500">
      
      <!-- ICON: Glowing Error Signal -->
      <div class="relative mb-6">
        <div class="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div class="relative h-20 w-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <ng-icon [name]="icon()" class="text-4xl stroke-[1.5]"></ng-icon>
        </div>
      </div>

      <!-- TEXT -->
      <div class="space-y-2 mb-8">
        <h2 class="text-2xl font-bold tracking-tight text-foreground">{{ title() }}</h2>
        <p class="text-muted-foreground max-w-xs mx-auto leading-relaxed">
          {{ message() }}
        </p>
      </div>

      <!-- ACTION -->
      <button (click)="retry.emit()" 
              hlmBtn 
              variant="outline" 
              class="h-12 px-8 rounded-xl border-border hover:bg-muted hover:text-foreground transition-all gap-2 group">
        <ng-icon name="lucideRefreshCcw" class="text-base group-active:rotate-180 transition-transform duration-500"></ng-icon>
        Reconnect Signal
      </button>
    </div>
  `
})
export class ErrorStateComponent {
    title = input<string>('Signal Interrupted');
    message = input<string>('We’re having trouble reaching the workstation. Please check your connection.');
    icon = input<string>('lucideWifiOff');
    retry = output<void>();
}
