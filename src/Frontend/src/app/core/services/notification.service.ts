import { Injectable, signal } from '@angular/core';
import type { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { toast } from 'ngx-sonner';

/**
 * Notification Message Interface
 */
export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

/**
 * NotificationService
 *
 * A service for displaying toast notifications to users.
 * Now acts as a bridge to ngx-sonner for consistent toast logic.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  /**
   * Reference to the confirm dialog component
   * Set by the app component on initialization
   */
  confirmDialog?: ConfirmDialogComponent;

  show(
    type: Notification['type'],
    message: string,
    title?: string,
    duration = 4000,
  ) {
    const toastFn = (type === 'error' ? toast.error :
      type === 'warning' ? toast.warning :
        type === 'info' ? toast.info : toast.success);

    toastFn(title || type.toUpperCase(), {
      description: message,
      duration: duration
    });
  }

  // Helper shortcuts
  success(message: string, title?: string) {
    this.show('success', message, title);
  }

  error(message: string, title?: string) {
    this.show('error', message, title, 6000); // Errors stay longer
  }

  warning(message: string, title?: string) {
    this.show('warning', message, title);
  }

  info(message: string, title?: string) {
    this.show('info', message, title);
  }

  /**
   * Display a confirmation dialog
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
    console.warn('Custom confirm dialog not found, falling back to browser confirm');
    return confirm(`${title}\n\n${message}`);
  }
}
