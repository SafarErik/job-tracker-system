import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog';

/**
 * Notification Types
 * Determines the visual style and icon of the notification
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification Message Interface
 */
export interface NotificationMessage {
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // milliseconds, default 4000
}

/**
 * NotificationService
 *
 * A service for displaying toast notifications to users.
 * Provides better UX than browser's alert() and confirm() dialogs.
 *
 * Usage:
 * ```typescript
 * this.notificationService.success('Application saved successfully!');
 * this.notificationService.error('Failed to save application');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Observable stream of notifications
   * Components can subscribe to this to display notifications
   */
  private readonly notificationSubject = new Subject<NotificationMessage>();
  public notifications$ = this.notificationSubject.asObservable();

  /**
   * Reference to the confirm dialog component
   * Set by the app component on initialization
   */
  confirmDialog?: ConfirmDialogComponent;

  /**
   * Show a success notification
   */
  success(message: string, title: string = 'Success'): void {
    this.show({
      type: 'success',
      title,
      message,
    });
  }

  /**
   * Show an error notification
   */
  error(message: string, title: string = 'Error'): void {
    this.show({
      type: 'error',
      title,
      message,
      duration: 6000, // Errors stay longer
    });
  }

  /**
   * Show a warning notification
   */
  warning(message: string, title: string = 'Warning'): void {
    this.show({
      type: 'warning',
      title,
      message,
    });
  }

  /**
   * Show an info notification
   */
  info(message: string, title: string = 'Info'): void {
    this.show({
      type: 'info',
      title,
      message,
    });
  }

  /**
   * Show a notification with custom settings
   */
  private show(notification: NotificationMessage): void {
    this.notificationSubject.next(notification);
  }

  /**
   * Display a confirmation dialog
   * Uses custom modal if available, falls back to browser confirm
   *
   * @param message - The confirmation message
   * @param title - The dialog title
   * @param config - Optional configuration
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  async confirm(
    message: string,
    title: string = 'Confirm Action',
    config?: {
      confirmText?: string;
      cancelText?: string;
      isDangerous?: boolean;
    },
  ): Promise<boolean> {
    // Use custom dialog if available
    if (this.confirmDialog) {
      return this.confirmDialog.show({
        title,
        message,
        confirmText: config?.confirmText || 'OK',
        cancelText: config?.cancelText || 'Cancel',
        isDangerous: config?.isDangerous ?? true,
      });
    }

    // Fallback to browser's confirm dialog
    return confirm(`${title}\n\n${message}`);
  }
}
