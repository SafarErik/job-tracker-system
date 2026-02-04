/**
 * ============================================================================
 * NAVBAR COMPONENT - Glass Navigation
 * ============================================================================
 *
 * Premium glassmorphism navigation bar with:
 * - Sticky positioning with backdrop blur
 * - Pill-shaped active navigation states
 * - User avatar and notification actions
 */

import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

// Core services
import { AuthService } from '../../core/auth';
import { ThemeService } from '../../core/services/theme.service';
import { LogoComponent } from '../../shared/components/logo/logo';

// Spartan UI Components
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LogoComponent,

    ...HlmButtonImports,
    ...HlmSeparatorImports,
    ...HlmDropdownMenuImports,
  ],
  templateUrl: './navbar.html',
  host: {
    class: 'block',
  },
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  // Auth state
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = computed(() => this.authService.user());
  readonly userFullName = computed(() => this.authService.userFullName());
  readonly userInitials = computed(() => this.authService.userInitials());

  // Navigation state
  readonly isLoginPage = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url.includes('/login')),
      startWith(this.router.url.includes('/login'))
    ),
    { initialValue: false }
  );

  // Mobile menu state
  readonly isMobileMenuOpen = signal(false);

  /**
   * Toggle mobile menu state
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }
}
