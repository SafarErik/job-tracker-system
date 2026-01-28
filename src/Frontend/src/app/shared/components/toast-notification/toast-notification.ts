import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  NotificationService,
  NotificationMessage,
} from '../../../core/services/notification.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideXCircle, lucideAlertTriangle, lucideInfo, lucideX } from '@ng-icons/lucide';

// Spartan UI
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';

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
  imports: [CommonModule, NgIcon, ...HlmAlertImports, ...HlmButtonImports, ...HlmIconImports],
  providers: [provideIcons({ lucideCheckCircle, lucideXCircle, lucideAlertTriangle, lucideInfo, lucideX })],
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

  constructor(private readonly notificationService: NotificationService) { }

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
   * Get HlmAlert variant for notification type
   */
  getVariant(type: string): 'default' | 'destructive' | 'success' | 'warning' | 'info' {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  }

  /**
   * Get icon name for notification type
   */
  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'lucideCheckCircle';
      case 'error':
        return 'lucideXCircle';
      case 'warning':
        return 'lucideAlertTriangle';
      case 'info':
        return 'lucideInfo';
      default:
        return 'lucideInfo';
    }
  }
}
