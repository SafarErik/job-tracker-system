import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
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
import { formatDistanceToNow } from 'date-fns';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'ai',
    title: 'Strategic Analysis Complete',
    message: 'AI has identified 3 new high-value opportunities at TechCorp based on your profile.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2m ago
    isRead: false,
  },
  {
    id: '2',
    type: 'company',
    title: 'New Position at Innovate Solutions',
    message: 'Innovate Solutions just posted a Senior Frontend Engineer role. Matching your skill set.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1h ago
    isRead: false,
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Interview Preparation',
    message: 'Your briefing for the Google interview is ready. Review technical tabs now.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
    isRead: true,
  },
];

@Component({
  selector: 'app-notification-center',
  standalone: true,
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
  notifications = signal<Notification[]>(mockNotifications);

  hasUnread = computed(() => this.notifications().some((n) => !n.isRead));

  getIcon(type: NotificationType): string {
    switch (type) {
      case 'ai':
        return 'lucideSparkles';
      case 'company':
        return 'lucideBuilding2';
      case 'reminder':
        return 'lucideClock';
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
    this.notifications.update((notes) => notes.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  markAllAsRead() {
    this.notifications.update((notes) => notes.map((n) => ({ ...n, isRead: true })));
  }
}
