/**
 * ============================================================================
 * ROOT APPLICATION COMPONENT
 * ============================================================================
 *
 * The main application shell component.
 * Contains the navigation header, router outlet, and global components.
 */

import { Component, ViewChild, AfterViewInit, inject, signal, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

// Core services
import { NotificationService, ThemeService } from './core/services';

// Layout components
import { NavbarComponent } from './layout';

// Shared components
import {
  ToastNotificationComponent,
  ConfirmDialogComponent,
} from './shared/components';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    ToastNotificationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.html',
})
export class App implements AfterViewInit {
  @ViewChild(ConfirmDialogComponent) confirmDialog?: ConfirmDialogComponent;
  private readonly _router = inject(Router);
  readonly isAuthPage = signal<boolean>(false);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
  ) {
    // Robustly track auth page status
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isAuthPage.set(this._router.url.startsWith('/auth'));
    });

    // Initial check
    this.isAuthPage.set(globalThis.location?.pathname?.startsWith('/auth') ?? false);
  }

  /**
   * After view initializes, connect the confirm dialog to the notification service
   */
  ngAfterViewInit(): void {
    if (this.confirmDialog) {
      this.notificationService.confirmDialog = this.confirmDialog;
    }
  }
}

