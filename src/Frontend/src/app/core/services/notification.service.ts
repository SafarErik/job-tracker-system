import { Injectable, signal, computed } from '@angular/core';
import { toast } from 'ngx-sonner';
import { Notification, NotificationType } from '../models/notification.model';
import type { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';

/**
 * NotificationService
 *
 * Manages both ephemeral toasts (ngx-sonner) and persistent notification history (Signal Store).
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

  // ── State ───────────────────────────────────────────────

  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.isRead).length
  );

  // ── Actions ─────────────────────────────────────────────

  /**
  * Adds a persistent notification to the history and shows an ephemeral toast.
  *
  * @param title - The title of the notification
  * @param message - The body message
  * @param type - The type of notification (system, company, ai, etc.)
  */
  add(title: string, message: string, type: NotificationType = 'system') {
    const newNote: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    this._notifications.update(notes => [newNote, ...notes]);

    // Also show toast for immediate feedback
    if (type === 'error') this.error(message, title);
    else if (type === 'ai') this.info(message, title, { duration: 6000 });
    else this.info(message, title);
  }

  /**
   * Marks a single notification as read.
   * @param id - The ID of the notification
   */
  markAsRead(id: string) {
    this._notifications.update(notes =>
      notes.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }

  /**
   * Marks all notifications in the history as read.
   */
  markAllAsRead() {
    this._notifications.update(notes =>
      notes.map(n => ({ ...n, isRead: true }))
    );
  }

  // ── Toast Wrappers (Ephemeral) ──────────────────────────

  show(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string,
    duration = 4000,
    options?: any
  ) {
    const toastFn = (type === 'error' ? toast.error :
      type === 'warning' ? toast.warning :
        type === 'info' ? toast.info : toast.success);

    toastFn(title || type.toUpperCase(), {
      description: message,
      duration: duration,
      ...options
    });
  }

  // Helper shortcuts
  success(message: string, title?: string, options?: any) {
    this.show('success', message, title, 4000, options);
  }

  error(message: string, title?: string, options?: any) {
    this.show('error', message, title, 6000, options); // Errors stay longer
  }

  warning(message: string, title?: string, options?: any) {
    this.show('warning', message, title, 4000, options);
  }

  info(message: string, title?: string, options?: any) {
    this.show('info', message, title, 4000, options);
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
