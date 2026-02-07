export type NotificationType = 'ai' | 'company' | 'reminder' | 'system';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}
