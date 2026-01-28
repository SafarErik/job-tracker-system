import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

// Spartan UI
import { HlmButtonImports } from '@spartan-ng/helm/button';

/**
 * Theme Toggle Component
 *
 * A modern, accessible toggle button for switching between light and dark themes.
 *
 * Features:
 * - Smooth animations and transitions
 * - Visual feedback for current theme mode
 * - Accessible keyboard navigation
 * - Modern icon design
 *
 * Usage:
 * <app-theme-toggle />
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule, ...HlmButtonImports],
  templateUrl: './theme-toggle.html',
  standalone: true,
})
export class ThemeToggleComponent {
  // Inject theme service using Angular's inject() function
  private readonly themeService = inject(ThemeService);

  // Current theme mode from the theme service
  protected readonly isDark = this.themeService.darkMode;

  // Computed label for accessibility and display
  protected readonly themeLabel = computed(() => {
    return this.isDark() ? 'Dark Mode' : 'Light Mode';
  });

  /**
   * Toggle between light and dark modes when button is clicked
   */
  protected onToggleTheme(): void {
    this.themeService.toggle();
  }
}
