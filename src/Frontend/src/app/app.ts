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
import { NgxSonnerToaster } from 'ngx-sonner';

// Core services
import { NotificationService, ThemeService } from './core/services';
import { ProfileStore } from './features/profile/services/profile.store';

// Shared components
import {
  ConfirmDialogComponent,
} from './shared/components';
import { ApplicationAddSheetComponent } from './features/job-applications/components/application-add-sheet/application-add-sheet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ConfirmDialogComponent, ApplicationAddSheetComponent, NgxSonnerToaster],
  templateUrl: './app.html',
})
export class App implements AfterViewInit {
  @ViewChild(ConfirmDialogComponent) confirmDialog?: ConfirmDialogComponent;
  private readonly _router = inject(Router);
  readonly isAuthPage = signal<boolean>(false);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly themeService: ThemeService,
    private readonly profileStore: ProfileStore,
  ) {
    // Initialize profile and skills globally
    this.profileStore.loadProfile();

    // Robustly track full-page layout status (Landing or Auth)
    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this._router.url.split('?')[0]; // Ignore query params
      this.isAuthPage.set(url === '/' || url.startsWith('/auth'));
    });

    // Initial check
    const path = globalThis.location?.pathname ?? '';
    this.isAuthPage.set(path === '/' || path.startsWith('/auth'));
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

