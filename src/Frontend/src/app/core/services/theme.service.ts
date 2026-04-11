import { Injectable, inject, signal, effect, PLATFORM_ID, computed } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);
  private _themeSwitchRafOne: number | null = null;
  private _themeSwitchRafTwo: number | null = null;

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

  readonly resolvedTheme = computed<'light' | 'dark'>(() =>
    this.isDark() ? 'dark' : 'light',
  );

  constructor() {
    // Initialize system preference
    if (isPlatformBrowser(this._platformId)) {
      const mediaQuery = this._document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

      if (mediaQuery) {
        this.systemPrefersDark.set(mediaQuery.matches);

        // Listen for OS-level changes
        mediaQuery.addEventListener('change', (e) => {
          this.systemPrefersDark.set(e.matches);
        });
      }
    }

    // Keep DOM theme state in sync with the active setting and system preference.
    effect(() => {
      this.syncTheme(this.themeSetting(), this.resolvedTheme());
    });
  }

  private getInitialTheme(): Theme {
    if (isPlatformBrowser(this._platformId)) {
      return (localStorage.getItem('theme') as Theme) ?? 'system';
    }
    return 'system';
  }

  private syncTheme(theme: Theme, resolvedTheme: 'light' | 'dark') {
    if (!isPlatformBrowser(this._platformId)) return;

    const html = this._document.documentElement;
    const nextIsDark = resolvedTheme === 'dark';
    const currentIsDark = html.classList.contains('dark');
    const isVisualThemeChange = currentIsDark !== nextIsDark;

    if (isVisualThemeChange) {
      this.startThemeSwitch();
    }

    html.dataset['theme'] = theme;
    html.classList.toggle('dark', nextIsDark);
    html.style.colorScheme = resolvedTheme;

    localStorage.setItem('theme', theme);
  }

  private startThemeSwitch(): void {
    const html = this._document.documentElement;
    const win = this._document.defaultView;

    if (!win) return;

    html.classList.add('theme-switching');

    if (this._themeSwitchRafOne !== null) {
      win.cancelAnimationFrame(this._themeSwitchRafOne);
      this._themeSwitchRafOne = null;
    }

    if (this._themeSwitchRafTwo !== null) {
      win.cancelAnimationFrame(this._themeSwitchRafTwo);
      this._themeSwitchRafTwo = null;
    }

    this._themeSwitchRafOne = win.requestAnimationFrame(() => {
      this._themeSwitchRafTwo = win.requestAnimationFrame(() => {
        html.classList.remove('theme-switching');
        this._themeSwitchRafOne = null;
        this._themeSwitchRafTwo = null;
      });
    });
  }

  toggle() {
    this.setTheme(this.isDark() ? 'light' : 'dark');
  }

  setTheme(theme: Theme) {
    this.themeSetting.set(theme);
  }
}
