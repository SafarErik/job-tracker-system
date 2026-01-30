import { Injectable, inject, signal, effect, PLATFORM_ID, computed } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);

  // The raw setting stored (light, dark, or system)
  readonly themeSetting = signal<Theme>(this.getInitialTheme());

  // A helper signal to know if we are effectively "dark" right now
  readonly isDark = computed(() => {
    const setting = this.themeSetting();
    if (setting === 'system') {
      return isPlatformBrowser(this._platformId)
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    }
    return setting === 'dark';
  });

  constructor() {
    // Whenever the setting changes, update the DOM and LocalStorage
    effect(() => {
      this.syncTheme(this.themeSetting());
    });

    // Listen for OS-level changes if set to 'system'
    if (isPlatformBrowser(this._platformId)) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
          if (this.themeSetting() === 'system') {
            this.syncTheme('system');
          }
        });
    }
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

  setTheme(theme: Theme) {
    this.themeSetting.set(theme);
  }
}