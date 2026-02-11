import { TimelineEventType } from '../../features/job-applications/models/timeline-event-type.enum';

export interface ApplicationTimelineEvent {
    id: string;
    occurredAt: string;
    eventType: TimelineEventType;
    title: string;
    description?: string;
    dueDate?: string;
    relatedDocumentId?: string;
}

export interface CreateApplicationTimelineEvent {
    jobApplicationId: string;
    occurredAt: string;
    eventType: TimelineEventType;
    title: string;
    description?: string;
    dueDate?: string;
    relatedDocumentId?: string;
}
