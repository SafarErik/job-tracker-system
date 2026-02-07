import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon, lucideLaptop, lucideChevronDown } from '@ng-icons/lucide';
import { HlmDropdownMenuImports, HlmDropdownMenuTrigger } from '@spartan-ng/helm/dropdown-menu';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    ...HlmButtonImports,
    NgIconComponent,
    ...HlmDropdownMenuImports,
    HlmDropdownMenuTrigger
  ],
  providers: [
    provideIcons({ lucideSun, lucideMoon, lucideLaptop, lucideChevronDown })
  ],
  template: `
    <button hlmBtn variant="ghost" size="sm" [hlmDropdownMenuTrigger]="themeMenu"
      class="flex items-center gap-2 px-3 h-9 rounded-xl transition-all hover:bg-muted/80 active:scale-95 border border-transparent hover:border-border group">
      
      <div class="relative h-4 w-4 flex items-center justify-center">
        @if (themeSetting() === 'light') {
          <ng-icon name="lucideSun" class="h-4 w-4 text-foreground animate-in fade-in zoom-in-50 duration-300"></ng-icon>
        } @else if (themeSetting() === 'dark') {
          <ng-icon name="lucideMoon" class="h-4 w-4 text-primary animate-in fade-in zoom-in-50 duration-300"></ng-icon>
        } @else {
          <ng-icon name="lucideLaptop" class="h-4 w-4 text-muted-foreground animate-in fade-in zoom-in-50 duration-300"></ng-icon>
        }
      </div>

      <span class="text-xs font-medium capitalize group-data-[state=open]:text-primary transition-colors">{{ themeSetting() === 'system' ? 'System' : themeSetting() }}</span>
      <ng-icon name="lucideChevronDown" class="h-3 w-3 opacity-50 group-data-[state=open]:rotate-180 transition-transform"></ng-icon>
    </button>

    <ng-template #themeMenu>
      <div hlmDropdownMenu class="w-40 bg-popover/95 backdrop-blur-xl border border-border p-1 rounded-xl shadow-2xl animate-in fade-in zoom-in-95">
        <button hlmDropdownMenuItem (click)="setTheme('light')" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg focus:bg-muted transition-colors cursor-pointer"
          [class.bg-muted]="themeSetting() === 'light'">
          <ng-icon name="lucideSun" class="h-4 w-4 opacity-70"></ng-icon>
          <span class="text-xs font-medium">Light</span>
        </button>
        <button hlmDropdownMenuItem (click)="setTheme('dark')" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg focus:bg-muted transition-colors cursor-pointer"
          [class.bg-muted]="themeSetting() === 'dark'">
          <ng-icon name="lucideMoon" class="h-4 w-4 text-primary"></ng-icon>
          <span class="text-xs font-medium">Dark</span>
        </button>
        <button hlmDropdownMenuItem (click)="setTheme('system')" 
          class="flex items-center gap-3 px-3 py-2 rounded-lg focus:bg-muted transition-colors cursor-pointer"
          [class.bg-muted]="themeSetting() === 'system'">
          <ng-icon name="lucideLaptop" class="h-4 w-4 text-muted-foreground opacity-70"></ng-icon>
          <span class="text-xs font-medium">System</span>
        </button>
      </div>
    </ng-template>
  `
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  themeSetting = this.themeService.themeSetting;

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
