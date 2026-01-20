import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationMessage } from '../../services/notification';

/**
 * ToastNotification Component
 *
 * Displays toast notifications in the top-right corner of the screen.
 * Automatically dismisses after a few seconds.
 *
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Smooth animations
 * - Stack multiple notifications
 */
@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.html',
  styleUrl: './toast-notification.css',
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  /**
   * Array of currently displayed notifications
   */
  notifications: (NotificationMessage & { id: number })[] = [];

  /**
   * Subscription to notification service
   */
  private subscription?: Subscription;

  /**
   * Auto-increment ID for tracking notifications
   */
  private nextId = 0;

  constructor(private readonly notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to notification service
    this.subscription = this.notificationService.notifications$.subscribe((notification) => {
      this.addNotification(notification);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    this.subscription?.unsubscribe();
  }

  /**
   * Add a new notification to the list
   */
  private addNotification(notification: NotificationMessage): void {
    const id = this.nextId++;
    const duration = notification.duration || 4000;

    // Add to array
    this.notifications.push({ ...notification, id });

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  }

  /**
   * Remove a notification by ID
   */
  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  /**
   * Get CSS classes for notification type
   */
  getNotificationClasses(type: string): string {
    const baseClasses = 'toast-item';
    switch (type) {
      case 'success':
        return `${baseClasses} toast-success`;
      case 'error':
        return `${baseClasses} toast-error`;
      case 'warning':
        return `${baseClasses} toast-warning`;
      case 'info':
        return `${baseClasses} toast-info`;
      default:
        return baseClasses;
    }
  }

  /**
   * Get icon for notification type
   */
  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }
}
