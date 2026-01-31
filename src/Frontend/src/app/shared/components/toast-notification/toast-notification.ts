import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle,
  lucideXCircle,
  lucideAlertTriangle,
  lucideInfo,
  lucideX,
} from '@ng-icons/lucide';

// Spartan UI
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';

/**
 * ToastNotification Component
 *
 * Displays toast notifications in the top-right corner of the screen.
 * Consumes the reactive queue from NotificationService.
 */
@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    ...HlmAlertImports,
    ...HlmButtonImports,
    ...HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideCheckCircle,
      lucideXCircle,
      lucideAlertTriangle,
      lucideInfo,
      lucideX,
    }),
  ],
  templateUrl: './toast-notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotificationComponent {
  private readonly _notificationService = inject(NotificationService);

  /**
   * Signal-based notification queue
   */
  readonly notifications = this._notificationService.queue;

  /**
   * Remove a notification by ID
   */
  removeNotification(id: number): void {
    this._notificationService.remove(id);
  }

  /**
   * Get HlmAlert variant for notification type
   */
  getVariant(
    type: string,
  ): 'default' | 'destructive' | 'success' | 'warning' | 'info' {
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
