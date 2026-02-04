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
    template: `
    <div class="relative inline-block">
      <button
        brnPopoverTrigger
        hlmBtn
        variant="ghost"
        size="icon"
        class="relative h-9 w-9 rounded-full transition-all hover:bg-muted/80 active:scale-95"
      >
        <ng-icon hlm name="lucideBell" class="h-5 w-5" />
        @if (hasUnread()) {
        <span
          class="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6] border-2 border-zinc-950"
        ></span>
        }
      </button>

      <ng-template brnPopoverContent let-condition="condition">
        <div
          hlmPopoverContent
          class="bg-zinc-950/90 border border-zinc-800 shadow-2xl rounded-2xl p-0 min-w-[380px] overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/20">
            <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Intelligence Feed</h3>
            <button
              hlmBtn
              variant="ghost"
              size="sm"
              (click)="markAllAsRead()"
              class="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
            >
              <ng-icon hlm name="lucideCheckCheck" class="mr-1.5 h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          <!-- Content -->
          <div class="max-h-[450px] overflow-y-auto scrollbar-hide">
            @if (notifications().length > 0) { @for (notification of notifications(); track notification.id) {
            <div
              (click)="markAsRead(notification.id)"
              class="relative flex gap-4 p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer group"
            >
              <!-- Unread Indicator -->
              @if (!notification.isRead) {
              <div class="absolute left-0 top-0 bottom-0 w-[2px] bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></div>
              }

              <!-- Icon/Avatar -->
              <div
                class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700 transition-colors"
              >
                <ng-icon hlm [name]="getIcon(notification.type)" class="h-5 w-5 text-zinc-400" />
              </div>

              <!-- Text -->
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-bold text-zinc-100 truncate">{{ notification.title }}</span>
                  <span class="text-[10px] font-medium text-zinc-500 whitespace-nowrap">{{
                    getTimestamp(notification.timestamp)
                  }}</span>
                </div>
                <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {{ notification.message }}
                </p>
              </div>
            </div>
            } } @else {
            <!-- Empty State -->
            <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div class="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                <ng-icon hlm name="lucideRadar" class="h-8 w-8 text-violet-500 animate-pulse" />
              </div>
              <h4 class="text-sm font-bold text-zinc-200 mb-1 leading-tight">Signal Clear</h4>
              <p class="text-[11px] text-zinc-500 tracking-wide uppercase font-medium">No new intelligence detected.</p>
            </div>
            }
          </div>
        </div>
      </ng-template>
    </div>
  `,
    styles: [
        `
      :host {
        display: block;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
    ],
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
