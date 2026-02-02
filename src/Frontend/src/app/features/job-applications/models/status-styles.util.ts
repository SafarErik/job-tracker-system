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
 * Semantic Status Palette
 * 
 * Active Statuses (Tinted Glass):
 * - PhoneScreen: Sky
 * - TechnicalTask: Amber  
 * - Interviewing: Violet
 * - Offer/Accepted: Emerald
 * 
 * Inbox Status:
 * - Applied: Slate/Neutral
 * 
 * Archived Statuses (Ghost Pattern):
 * - Rejected/Ghosted: Muted with opacity-60 grayscale on container
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
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
        label: 'Offer Received',
        columnBorder: 'border-emerald-500',
        columnText: 'text-emerald-500',
    },
    [JobApplicationStatus.Accepted]: {
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        label: 'Accepted',
        columnBorder: 'border-emerald-500',
        columnText: 'text-emerald-500',
    },
    [JobApplicationStatus.Rejected]: {
        badge: 'bg-slate-200/10 text-slate-500 border-slate-300/20',
        label: 'Rejected',
        containerModifier: 'opacity-60 grayscale',
        columnBorder: 'border-slate-400',
        columnText: 'text-slate-400',
    },
    [JobApplicationStatus.Ghosted]: {
        badge: 'bg-slate-200/10 text-slate-500 border-slate-300/20',
        label: 'Ghosted',
        containerModifier: 'opacity-60 grayscale',
        columnBorder: 'border-slate-400',
        columnText: 'text-slate-400',
    },
};

/**
 * Get status style configuration
 */
export function getStatusStyle(status: JobApplicationStatus): StatusStyle {
    return STATUS_STYLES[status] ?? STATUS_STYLES[JobApplicationStatus.Applied];
}

/**
 * Get badge classes for a status
 */
export function getStatusBadgeClasses(status: JobApplicationStatus): string {
    const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border';
    const style = getStatusStyle(status);

    // Add pulse animation for active interviewing statuses
    const isActive = [
        JobApplicationStatus.PhoneScreen,
        JobApplicationStatus.TechnicalTask,
        JobApplicationStatus.Interviewing,
    ].includes(status);

    return `${base} ${style.badge}${isActive ? ' animate-pulse' : ''}`;
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
