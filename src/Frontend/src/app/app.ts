/**
 * ============================================================================
 * ROOT APPLICATION COMPONENT
 * ============================================================================
 *
 * The main application shell component.
 * Contains the navigation header, router outlet, and global components.
 */

import { Component, signal, ViewChild, AfterViewInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Core services
import { AuthService } from './core/auth';
import { NotificationService, ThemeService } from './core/services';

// Shared components & directives
import {
  ToastNotificationComponent,
  ConfirmDialogComponent,
  ThemeToggleComponent,
} from './shared/components';
import { ClickOutsideDirective } from './shared/directives';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastNotificationComponent,
    ConfirmDialogComponent,
    ThemeToggleComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly title = signal('job-tracker-client');

  @ViewChild(ConfirmDialogComponent) confirmDialog?: ConfirmDialogComponent;

  // Inject AuthService
  private readonly authService = inject(AuthService);

  // Auth state exposed to template using computed to avoid initialization issues
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly currentUser = computed(() => this.authService.currentUser());
  readonly userFullName = computed(() => this.authService.userFullName());
  readonly userInitials = computed(() => this.authService.userInitials());

  // User dropdown state
  showUserMenu = signal(false);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
  ) {}

  /**
   * After view initializes, connect the confirm dialog to the notification service
   */
  ngAfterViewInit(): void {
    if (this.confirmDialog) {
      this.notificationService.confirmDialog = this.confirmDialog;
    }
  }

  /**
   * Toggle user dropdown menu
   */
  toggleUserMenu(): void {
    this.showUserMenu.update((show) => !show);
  }

  /**
   * Close user dropdown menu
   */
  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }
}
