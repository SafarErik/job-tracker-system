import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideCalendar,
    lucideClock,
    lucideVideo,
    lucideTerminal,
    lucideAlertCircle,
    lucidePlus,
    lucideRefreshCw,
    lucideExternalLink,
    lucideZap,
    lucideTrash2,
    lucideEdit3
} from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/notification.service';

interface TimelineEvent {
    id: string;
    type: 'technical' | 'interview' | 'deadline' | 'other';
    title: string;
    description: string;
    date: Date;
    link?: string;
    isOngoing?: boolean;
}

@Component({
    selector: 'app-timeline-view',
    standalone: true,
    imports: [CommonModule, NgIcon, FormsModule],
    providers: [
        provideIcons({
            lucideCalendar,
            lucideClock,
            lucideVideo,
            lucideTerminal,
            lucideAlertCircle,
            lucidePlus,
            lucideRefreshCw,
            lucideExternalLink,
            lucideZap,
            lucideTrash2,
            lucideEdit3
        })
    ],
    templateUrl: './timeline-view.component.html',
    styleUrls: ['./timeline-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineViewComponent {
    private readonly notificationService = inject(NotificationService);

    events = signal<TimelineEvent[]>([
        {
            id: '1',
            type: 'interview',
            title: 'Round 1: System Design',
            description: 'Focus on scalability and data consistency.',
            date: new Date(Date.now() + 1000 * 60 * 30), // 30 mins from now
            link: 'https://zoom.us/j/123456',
            isOngoing: true
        },
        {
            id: '2',
            type: 'technical',
            title: 'At-Home Assignment',
            description: 'Implement a distributed rate limiter.',
            date: new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days from now
        },
        {
            id: '3',
            type: 'deadline',
            title: 'Offer Acceptance Deadline',
            description: 'Final decision needed for Vanguard proposal.',
            date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        }
    ]);

    isAddingEvent = signal(false);
    newEvent = signal({
        title: '',
        type: 'technical' as const,
        date: '',
        description: '',
        link: ''
    });

    isCalendarConnected = signal(false);
    lastSynced = signal('Just now');

    // Computed for sorting events by date
    sortedEvents = computed(() => {
        return [...this.events()].sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    toggleAddForm() {
        this.isAddingEvent.update(v => !v);
    }

    addEvent() {
        const data = this.newEvent();
        if (!data.title || !data.date) return;

        const event: TimelineEvent = {
            id: Math.random().toString(36).substring(7),
            type: data.type,
            title: data.title,
            description: data.description,
            date: new Date(data.date),
            link: data.link
        };

        this.events.update(evs => [...evs, event]);

        if (event.type === 'technical') {
            this.notificationService.info('Reminder set 24h before deadline.', 'Technical Task');
        }

        this.isAddingEvent.set(false);
        this.newEvent.set({ title: '', type: 'technical', date: '', description: '', link: '' });
        this.notificationService.success('Tactical Event Scheduled!', 'Timeline');
    }

    deleteEvent(id: string) {
        this.events.update(evs => evs.filter(e => e.id !== id));
        this.notificationService.info('Event removed from roadmap.', 'Timeline');
    }

    connectCalendar() {
        this.notificationService.info('Connecting to Google Command Center...', 'Sync');
        setTimeout(() => {
            this.isCalendarConnected.set(true);
            this.notificationService.success('Google Calendar Integrated!', 'Success');
        }, 2000);
    }

    getTimeRemaining(date: Date): string {
        const diff = date.getTime() - Date.now();
        if (diff < 0) return 'Passed';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    }

    openPrepDojo() {
        // This is a placeholder for a parent communication or global navigation
        this.notificationService.info('Redirecting to The Dojo...', 'Interview Prep');
    }
}
