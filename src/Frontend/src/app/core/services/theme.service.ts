import { Injectable, inject, signal, effect, PLATFORM_ID, computed } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);

  // The raw setting stored (light, dark, or system)
  readonly themeSetting = signal<Theme>(this.getInitialTheme());

  // Signal for OS preference
  readonly systemPrefersDark = signal<boolean>(false);

  // A helper signal to know if we are effectively "dark" right now
  readonly isDark = computed(() => {
    const setting = this.themeSetting();
    if (setting === 'system') {
      return this.systemPrefersDark();
    }
    return setting === 'dark';
  });

  constructor() {
    // Initialize system preference
    if (isPlatformBrowser(this._platformId)) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPrefersDark.set(mediaQuery.matches);

      // Listen for OS-level changes
      mediaQuery.addEventListener('change', (e) => {
        this.systemPrefersDark.set(e.matches);
        if (this.themeSetting() === 'system') {
          this.syncTheme('system');
        }
      });
    }

    // Whenever the setting or system preference changes, update the DOM (effect checks dependencies)
    effect(() => {
      this.syncTheme(this.themeSetting());
    });
  }

  private getInitialTheme(): Theme {
    if (isPlatformBrowser(this._platformId)) {
      return (localStorage.getItem('theme') as Theme) ?? 'system';
    }
    return 'system';
  }

  /**
   * The "Sync" core logic. 
   * Updates the HTML class and the color-scheme meta tag.
   */
  private syncTheme(theme: Theme) {
    if (!isPlatformBrowser(this._platformId)) return;

    const html = this._document.documentElement;
    const effectiveIsDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (effectiveIsDark) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }

    localStorage.setItem('theme', theme);
  }

  toggle() {
    // Check if the browser supports View Transitions
    if (!(this._document as any).startViewTransition) {
      this.themeSetting.update(t => t === 'dark' ? 'light' : 'dark');
      return;
    }

    // Cinematic fade transition
    (this._document as any).startViewTransition(() => {
      this.themeSetting.update(t => t === 'dark' ? 'light' : 'dark');
    });
  }

  setTheme(theme: Theme) {
    this.themeSetting.set(theme);
  }
}