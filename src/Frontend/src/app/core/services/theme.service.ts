import { Injectable, signal, effect } from '@angular/core';

/**
 * Theme mode options - simplified to light/dark only
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme Service
 *
 * Manages application theme with support for:
 * - Manual dark/light mode selection
 * - LocalStorage persistence
 * - Reactive updates using Angular signals
 *
 * Best practices:
 * - Uses CSS custom properties for theming
 * - Provides smooth transitions between themes
 * - Persists user choice across sessions
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Storage key for persisting theme preference
  private readonly THEME_STORAGE_KEY = 'job-tracker-theme';

  // Signal for the selected theme mode (what the user chose)
  public readonly themeMode = signal<ThemeMode>(this.getStoredTheme());

  constructor() {
    // Apply theme immediately on initialization
    const initialTheme = this.themeMode();
    this.applyThemeSync(initialTheme);

    // React to theme mode changes
    effect(() => {
      const mode = this.themeMode();
      this.saveThemeToStorage(mode);
      this.applyThemeSync(mode);
    });
  }

  /**
   * Set the theme mode
   * @param mode - The theme mode to apply
   */
  public setThemeMode(mode: ThemeMode): void {
    this.themeMode.set(mode);
  }

  /**
   * Toggle between light and dark modes
   */
  public toggleTheme(): void {
    const current = this.themeMode();
    this.themeMode.set(current === 'dark' ? 'light' : 'dark');
  }

  /**
   * Apply the theme to the DOM (synchronous version for immediate application)
   * @param theme - The theme to apply
   */
  private applyThemeSync(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the appropriate class
    root.classList.add(theme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
  }

  /**
   * Update meta theme-color tag for mobile browsers
   * @param theme - The current theme
   */
  private updateMetaThemeColor(theme: ThemeMode): void {
    if (typeof document === 'undefined') return;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#0f172a' : '#ffffff';

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  /**
   * Get stored theme from localStorage
   * @returns Stored theme or 'light' as default
   */
  private getStoredTheme(): ThemeMode {
    try {
      const stored = localStorage.getItem(this.THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
    }

    // Default to light theme
    return 'light';
  }

  /**
   * Save theme preference to localStorage
   * @param mode - The theme mode to save
   */
  private saveThemeToStorage(mode: ThemeMode): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }
}
