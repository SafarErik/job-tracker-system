import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideSparkles,
  lucideBuilding2,
  lucideClock,
  lucideRadar,
  lucideCheckCheck,
} from '@ng-icons/lucide';
import { BrnPopoverContent, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { Notification, NotificationType } from '../../core/models/notification.model';
import { NotificationService } from '../../core/services/notification.service';
import { formatDistanceToNow } from 'date-fns';

@Component({
  selector: 'app-notification-center',
  imports: [
    CommonModule,
    HlmButton,
    ...HlmIconImports,
    BrnPopoverTrigger,
    BrnPopoverContent,
    ...HlmPopoverImports,
  ],
  providers: [
    provideIcons({
      lucideBell,
      lucideSparkles,
      lucideBuilding2,
      lucideClock,
      lucideRadar,
      lucideCheckCheck,
    }),
  ],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent {
  private service = inject(NotificationService);

  notifications = this.service.notifications;
  hasUnread = computed(() => this.notifications().some((n) => !n.isRead));

  getIcon(type: NotificationType): string {
    switch (type) {
      case 'ai':
        return 'lucideSparkles';
      case 'company':
        return 'lucideBuilding2';
      case 'reminder':
        return 'lucideClock';
      case 'success':
        return 'lucideCheckCheck';
      case 'error':
      case 'warning':
        return 'lucideBell'; // Or appropriate error icon
      default:
        return 'lucideBell';
    }
  }

  getTimestamp(timestamp: string): string {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true }).replace('about ', '');
    } catch {
      return 'just now';
    }
  }

  markAsRead(id: string) {
    this.service.markAsRead(id);
  }

  markAllAsRead() {
    this.service.markAllAsRead();
  }
}
