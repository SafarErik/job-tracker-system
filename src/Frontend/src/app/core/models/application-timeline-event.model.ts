import { TimelineEventType } from '../../features/job-applications/models/timeline-event-type.enum';

export interface ApplicationTimelineEventDto {
    id: string;
    occurredAt: string;
    eventType: TimelineEventType;
    title: string;
    description?: string;
    dueDate?: string;
    relatedDocumentId?: string;
}

export interface CreateApplicationTimelineEventDto {
    jobApplicationId: string;
    occurredAt: string;
    eventType: TimelineEventType;
    title: string;
    description?: string;
    dueDate?: string;
    relatedDocumentId?: string;
}

export type ApplicationTimelineEvent = ApplicationTimelineEventDto;
export type CreateApplicationTimelineEvent = CreateApplicationTimelineEventDto;
