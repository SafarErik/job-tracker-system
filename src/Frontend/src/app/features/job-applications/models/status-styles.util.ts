import { JobApplicationStatus } from './application-status.enum';

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
 * Semantic Status Palette - "Gradient of Progress"
 * Uses "Tinted Glass" aesthetic: low opacity bg, solid text, medium opacity border.
 */
export const STATUS_STYLES: Record<JobApplicationStatus, StatusStyle> = {
    [JobApplicationStatus.Applied]: {
        badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        label: 'Applied',
        columnBorder: 'border-slate-500',
        columnText: 'text-slate-500',
    },
    [JobApplicationStatus.PhoneScreen]: {
        badge: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
        label: 'Phone Screen',
        columnBorder: 'border-sky-500',
        columnText: 'text-sky-500',
    },
    [JobApplicationStatus.TechnicalTask]: {
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        label: 'Technical Task',
        columnBorder: 'border-amber-500',
        columnText: 'text-amber-500',
    },
    [JobApplicationStatus.Interviewing]: {
        badge: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
        label: 'Interviewing',
        columnBorder: 'border-violet-500',
        columnText: 'text-violet-500',
    },
    [JobApplicationStatus.Offer]: {
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        label: 'Offer Received',
        columnBorder: 'border-emerald-500',
        columnText: 'text-emerald-500',
    },
    [JobApplicationStatus.Accepted]: {
        badge: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
        label: 'Accepted',
        columnBorder: 'border-teal-500',
        columnText: 'text-teal-500',
    },
    [JobApplicationStatus.Rejected]: {
        badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        label: 'Rejected',
        columnBorder: 'border-rose-500',
        columnText: 'text-rose-500',
    },
    [JobApplicationStatus.Ghosted]: {
        badge: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
        label: 'Ghosted',
        columnBorder: 'border-zinc-500',
        columnText: 'text-zinc-500',
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
