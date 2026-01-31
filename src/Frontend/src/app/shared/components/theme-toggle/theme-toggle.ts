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
      class="relative flex h-9 w-9 items-center justify-center rounded-full transition-all hover:bg-muted/80 active:scale-90"
      [attr.aria-label]="label()">
      
      <div class="relative h-5 w-5 flex items-center justify-center">
        <!-- Sun Icon (Light Mode) -->
        <ng-icon name="lucideSun" 
          class="h-5 w-5 transition-all duration-500 absolute text-foreground"
          [style.opacity]="isDark() ? '0' : '1'"
          [style.transform]="isDark() ? 'translateY(12px) rotate(90deg)' : 'translateY(0) rotate(0)'">
        </ng-icon>
  
        <!-- Moon Icon (Dark Mode) -->
        <ng-icon name="lucideMoon" 
          class="h-5 w-5 text-primary transition-all duration-500 absolute"
          [style.opacity]="isDark() ? '1' : '0'"
          [style.transform]="isDark() ? 'translateY(0) rotate(0)' : 'translateY(-12px) rotate(-90deg)'">
        </ng-icon>
      </div>
      
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
