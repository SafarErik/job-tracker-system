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
        badge: 'bg-slate-500/10 text-slate-300 border-slate-500/30 shadow-[0_0_12px_-3px_rgba(100,116,139,0.3)]',
        label: 'Applied',
        columnBorder: 'border-slate-500/50',
        columnText: 'text-slate-400',
    },
    [JobApplicationStatus.PhoneScreen]: {
        badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_12px_-3px_rgba(59,130,246,0.3)]',
        label: 'Phone Screen',
        columnBorder: 'border-blue-500/50',
        columnText: 'text-blue-400',
    },
    [JobApplicationStatus.TechnicalTask]: {
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]',
        label: 'Technical Task',
        columnBorder: 'border-amber-500/50',
        columnText: 'text-amber-400',
    },
    [JobApplicationStatus.Interviewing]: {
        badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30 shadow-[0_0_12px_-3px_rgba(139,92,246,0.5)]', // Little stronger
        label: 'Interviewing',
        columnBorder: 'border-violet-500/50',
        columnText: 'text-violet-400',
    },
    [JobApplicationStatus.Offer]: {
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_-3px_rgba(16,185,129,0.4)]',
        label: 'Offer Received',
        columnBorder: 'border-emerald-500/50',
        columnText: 'text-emerald-400',
    },
    [JobApplicationStatus.Accepted]: {
        badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_-3px_rgba(6,182,212,0.4)]',
        label: 'Accepted',
        columnBorder: 'border-cyan-500/50',
        columnText: 'text-cyan-400',
    },
    [JobApplicationStatus.Rejected]: {
        badge: 'bg-rose-500/5 text-rose-400 border-rose-500/20 opacity-80', // Less glow, more "dead"
        label: 'Rejected',
        columnBorder: 'border-rose-500/40',
        columnText: 'text-rose-400',
    },
    [JobApplicationStatus.Ghosted]: {
        badge: 'bg-zinc-500/5 text-zinc-400 border-zinc-500/20 opacity-70', // Ghostly
        label: 'Ghosted',
        columnBorder: 'border-zinc-500/40',
        columnText: 'text-zinc-400',
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
