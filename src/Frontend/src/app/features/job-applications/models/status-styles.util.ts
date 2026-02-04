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
        badge: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border-zinc-500/30',
        label: 'Applied',
        columnBorder: 'border-zinc-500/50',
        columnText: 'text-zinc-600 dark:text-zinc-400',
    },
    [JobApplicationStatus.PhoneScreen]: {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/30',
        label: 'Phone Screen',
        columnBorder: 'border-blue-500/50',
        columnText: 'text-blue-600 dark:text-blue-400',
    },
    [JobApplicationStatus.TechnicalTask]: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30',
        label: 'Technical Task',
        columnBorder: 'border-amber-500/50',
        columnText: 'text-amber-600 dark:text-amber-400',
    },
    [JobApplicationStatus.Interviewing]: {
        badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/30',
        label: 'Interviewing',
        columnBorder: 'border-violet-500/50',
        columnText: 'text-violet-600 dark:text-violet-400',
    },
    [JobApplicationStatus.Offer]: {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
        label: 'Offer Received',
        columnBorder: 'border-emerald-500/50',
        columnText: 'text-emerald-600 dark:text-emerald-400',
    },
    [JobApplicationStatus.Accepted]: {
        badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/30',
        label: 'Accepted',
        columnBorder: 'border-cyan-500/50',
        columnText: 'text-cyan-600 dark:text-cyan-400',
    },
    [JobApplicationStatus.Rejected]: {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 opacity-80',
        label: 'Rejected',
        columnBorder: 'border-rose-500/40',
        columnText: 'text-rose-600 dark:text-rose-400',
    },
    [JobApplicationStatus.Ghosted]: {
        badge: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20 opacity-70',
        label: 'Ghosted',
        columnBorder: 'border-zinc-500/40',
        columnText: 'text-zinc-500 dark:text-zinc-400',
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
            return `${base} text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20`;
        case JobPriority.Medium:
            return `${base} text-foreground/80 bg-muted border-border`;
        case JobPriority.Low:
            return `${base} text-muted-foreground bg-muted/50 border-border/50`;
        default:
            return `${base} bg-muted text-muted-foreground border-border`;
    }
}

