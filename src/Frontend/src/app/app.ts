/**
 * ============================================================================
 * ROOT APPLICATION COMPONENT
 * ============================================================================
 *
 * The main application shell component.
 * Contains the navigation header, router outlet, and global components.
 */

import { Component, ViewChild, AfterViewInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
    RouterOutlet,
    NavbarComponent,
    ToastNotificationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './app.html',
})
export class App implements AfterViewInit {
  @ViewChild(ConfirmDialogComponent) confirmDialog?: ConfirmDialogComponent;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
  ) { }

  /**
   * After view initializes, connect the confirm dialog to the notification service
   */
  ngAfterViewInit(): void {
    if (this.confirmDialog) {
      this.notificationService.confirmDialog = this.confirmDialog;
    }
  }
}

