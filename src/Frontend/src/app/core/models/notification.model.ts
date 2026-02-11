export type NotificationType = 'ai' | 'company' | 'reminder' | 'system' | 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}
