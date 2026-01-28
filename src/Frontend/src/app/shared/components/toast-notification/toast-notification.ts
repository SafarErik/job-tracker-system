import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  NotificationService,
  NotificationMessage,
} from '../../../core/services/notification.service';

// Spartan UI
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

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
  imports: [CommonModule, ...HlmButtonImports, ...HlmCardImports],
  templateUrl: './toast-notification.html',
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
   * Get Tailwind classes for notification type
   */
  getNotificationClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500';
      case 'error':
        return 'border-l-4 border-l-destructive';
      case 'warning':
        return 'border-l-4 border-l-yellow-500';
      case 'info':
        return 'border-l-4 border-l-primary';
      default:
        return '';
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
