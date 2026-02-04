import { JobApplicationStatus } from './application-status.enum';
import { JobPriority } from './job-priority.enum';

/**
 * Status Style Configuration
 * Semantic palette for job application statuses following the "Tinted Glass" pattern
 */
export interface StatusStyle {
    /** Badge classes (bg + text + border) */
    badge: string;
    /** Label for display */
    label: string;
    /** Container modifier classes (for Ghost Pattern) */
    containerModifier?: string;
    /** Column border color class */
    columnBorder: string;
    /** Column header text color class */
    columnText: string;
}

/**
 * Semantic Status Palette - Theme-aware for both light and dark modes
 * Uses "Tinted Glass" aesthetic with appropriate contrast for each mode.
 */
export const STATUS_STYLES: Record<JobApplicationStatus, StatusStyle> = {
    [JobApplicationStatus.Applied]: {
        badge: 'bg-muted text-muted-foreground border-border',
        label: 'Applied',
        columnBorder: 'border-border/50',
        columnText: 'text-muted-foreground',
    },
    [JobApplicationStatus.PhoneScreen]: {
        badge: 'bg-info/10 text-info border-info/30',
        label: 'Phone Screen',
        columnBorder: 'border-info/50',
        columnText: 'text-info',
    },
    [JobApplicationStatus.TechnicalTask]: {
        badge: 'bg-warning/10 text-warning border-warning/30',
        label: 'Technical Task',
        columnBorder: 'border-warning/50',
        columnText: 'text-warning',
    },
    [JobApplicationStatus.Interviewing]: {
        badge: 'bg-primary/10 text-primary border-primary/30',
        label: 'Interviewing',
        columnBorder: 'border-primary/50',
        columnText: 'text-primary',
    },
    [JobApplicationStatus.Offer]: {
        badge: 'bg-success/10 text-success border-success/30',
        label: 'Offer Received',
        columnBorder: 'border-success/50',
        columnText: 'text-success',
    },
    [JobApplicationStatus.Accepted]: {
        badge: 'bg-primary/20 text-primary border-primary/40',
        label: 'Accepted',
        columnBorder: 'border-primary/60',
        columnText: 'text-primary',
    },
    [JobApplicationStatus.Rejected]: {
        badge: 'bg-destructive/10 text-destructive border-destructive/20 opacity-80',
        label: 'Rejected',
        columnBorder: 'border-destructive/40',
        columnText: 'text-destructive',
    },
    [JobApplicationStatus.Ghosted]: {
        badge: 'bg-muted/50 text-muted-foreground/60 border-border/20 opacity-70',
        label: 'Ghosted',
        columnBorder: 'border-border/40',
        columnText: 'text-muted-foreground',
    },
};

/**
 * Get status style configuration
 */
export function getStatusStyle(status: JobApplicationStatus): StatusStyle {
    return STATUS_STYLES[status] ?? STATUS_STYLES[JobApplicationStatus.Applied];
}

/**
 * Get the semantic Tailwind classes for a status badge
 * Returns a string of BG, Text, and Border classes.
 */
export function getStatusStyles(status: JobApplicationStatus): string {
    return getStatusStyle(status).badge;
}

/**
 * Get badge classes for a status (Enhanced with pulse animation)
 */
export function getStatusBadgeClasses(status: JobApplicationStatus): string {
    const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border';
    const styles = getStatusStyles(status);

    // Add pulse animation for active interviewing statuses
    const isActive = [
        JobApplicationStatus.PhoneScreen,
        JobApplicationStatus.TechnicalTask,
        JobApplicationStatus.Interviewing,
    ].includes(status);

    return `${base} ${styles}${isActive ? ' animate-pulse' : ''}`;
}

/**
 * Get container modifier classes for Ghost Pattern
 */
export function getContainerModifier(status: JobApplicationStatus): string {
    return getStatusStyle(status).containerModifier ?? '';
}

/**
 * Check if status is archived (Ghost Pattern applies)
 */
export function isArchivedStatus(status: JobApplicationStatus): boolean {
    return [JobApplicationStatus.Rejected, JobApplicationStatus.Ghosted].includes(status);
}

/**
 * Check if status is active (interviewing process)
 */
export function isActiveStatus(status: JobApplicationStatus): boolean {
    return [
        JobApplicationStatus.PhoneScreen,
        JobApplicationStatus.TechnicalTask,
        JobApplicationStatus.Interviewing,
    ].includes(status);
}

/**
 * Check if status is an offer
 */
export function isOfferStatus(status: JobApplicationStatus): boolean {
    return [JobApplicationStatus.Offer, JobApplicationStatus.Accepted].includes(status);
}

/**
 * Check if status is inbox (Applied only)
 */
export function isInboxStatus(status: JobApplicationStatus): boolean {
    return status === JobApplicationStatus.Applied;
}

/**
 * Get the semantic Tailwind classes for a priority badge
 */
export function getPriorityBadgeClasses(priority: JobPriority | undefined): string {
    const base = 'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border';

    if (priority === undefined) return `${base} bg-muted text-muted-foreground border-border`;

    switch (priority) {
        case JobPriority.High:
            return `${base} text-primary bg-primary/10 border-primary/20`;
        case JobPriority.Medium:
            return `${base} text-foreground/80 bg-muted border-border`;
        case JobPriority.Low:
            return `${base} text-muted-foreground bg-muted/50 border-border/50`;
        default:
            return `${base} bg-muted text-muted-foreground border-border`;
    }
}

