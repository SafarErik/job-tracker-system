import { Injectable, signal, inject, PLATFORM_ID, RendererFactory2, effect } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private renderer = inject(RendererFactory2).createRenderer(null, null);

  // The single source of truth for the theme
  readonly theme = signal<Theme>('light');
  // Computed helper for existing consumers (optional, but good for backward compat if needed)
  readonly darkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();

      // Sync the boolean helper whenever theme changes
      effect(() => {
        this.darkMode.set(this.theme() === 'dark');
      }, { allowSignalWrites: true });
    }
  }

  private initializeTheme() {
    // 1. Check local storage
    const stored = localStorage.getItem('theme') as Theme;
    // 2. Check system preference
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine initial theme
    const initialTheme = stored || (systemDark ? 'dark' : 'light');

    // Set signal
    this.theme.set(initialTheme);

    // Ensure DOM is synced (though index.html script should have handled this)
    this.applyThemeToDom(initialTheme);
  }

  toggle() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateThemeState();
  }

  private updateThemeState() {
    this.theme.update(current => {
      const newTheme = current === 'light' ? 'dark' : 'light';
      this.applyThemeToDom(newTheme);
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  }

  // You can keep this for the initial load in constructor
  private applyThemeToDom(theme: Theme) {
    const html = this.document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
