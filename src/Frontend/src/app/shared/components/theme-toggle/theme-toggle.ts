import { Component, inject, computed } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [HlmButtonImports, NgIconComponent],
  providers: [provideIcons({ lucideSun, lucideMoon })],
  template: `
    <button hlmBtn variant="ghost" size="icon" (click)="themeService.toggle()"
      class="relative h-9 w-9 rounded-full transition-colors hover:bg-muted/60"
      [attr.aria-label]="label()">
      
      <!-- Sun Icon (Light Mode) -->
      <ng-icon name="lucideSun" 
        class="h-5 w-5 transition-all duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        [class.rotate-0]="!isDark()"
        [class.scale-100]="!isDark()"
        [class.rotate-90]="isDark()"
        [class.scale-0]="isDark()">
      </ng-icon>

      <!-- Moon Icon (Dark Mode) -->
      <ng-icon name="lucideMoon" 
        class="h-5 w-5 text-primary transition-all duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        [class.rotate-90]="!isDark()"
        [class.scale-0]="!isDark()"
        [class.rotate-0]="isDark()"
        [class.scale-100]="isDark()">
      </ng-icon>
      
      <span class="sr-only">{{ label() }}</span>
    </button>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  isDark = this.themeService.isDark;

  label = computed(() =>
    this.isDark() ? 'Switch to light mode' : 'Switch to dark mode'
  );
}
