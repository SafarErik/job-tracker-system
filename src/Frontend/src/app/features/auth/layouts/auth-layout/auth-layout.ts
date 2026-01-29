import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <!-- Theme Toggle (Absolute Top Right) -->
    <div class="fixed top-6 right-6 z-50">
      <button
        (click)="themeService.toggle()"
        class="flex h-10 w-10 items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
        aria-label="Toggle theme"
      >
        @if (themeService.darkMode()) {
          <svg class="h-5 w-5 text-amber-400 fill-amber-400/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        } @else {
          <svg class="h-5 w-5 text-indigo-500 fill-indigo-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        }
      </button>
    </div>

    <!-- Simplified Layout relying on global App Shell background -->
    <div class="w-full flex items-center justify-center">
      <!-- Content Container -->
      <div class="w-full max-w-[480px]">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {
  readonly themeService = inject(ThemeService);
}
