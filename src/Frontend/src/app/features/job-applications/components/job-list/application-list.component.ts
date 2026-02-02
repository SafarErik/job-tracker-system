import { Component, input, output, ChangeDetectionStrategy, inject, computed, viewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplication } from '../../models/job-application.model';
import { Router } from '@angular/router';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { LogoPlaceholderComponent } from '../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideArchive, lucideExternalLink } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import autoAnimate from '@formkit/auto-animate';

@Component({
    selector: 'app-application-list',
    standalone: true,
    imports: [
        CommonModule,
        LogoPlaceholderComponent,
        NgIcon,
        ...HlmButtonImports
    ],
    providers: [provideIcons({ lucidePencil, lucideArchive, lucideExternalLink })],
    templateUrl: './application-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationListComponent implements AfterViewInit {
    apps = input.required<JobApplication[]>();
    private readonly router = inject(Router);

    listBody = viewChild<ElementRef>('listBody');

    ngAfterViewInit(): void {
        const el = this.listBody()?.nativeElement;
        if (el) autoAnimate(el);
    }

    viewApplicationDetail(id: string): void {
        this.router.navigate(['/applications', id]);
    }

    getLogoUrl(companyName?: string): string | null {
        if (!companyName) return null;
        const sanitized = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return `https://logo.clearbit.com/${sanitized}.com`;
    }

    onLogoError(event: any): void {
        event.target.style.display = 'none';
        // The placeholder will be shown via @else in template if we had a logoFailed signal per row, 
        // but for list we can just hide the img and let the parent handle it or use a more robust way.
        // For now, let's just make it work.
    }

    getStatusLabel(status: JobApplicationStatus): string {
        switch (status) {
            case JobApplicationStatus.Applied: return 'Applied';
            case JobApplicationStatus.PhoneScreen: return 'Phone Screen';
            case JobApplicationStatus.TechnicalTask: return 'Tech Task';
            case JobApplicationStatus.Interviewing: return 'Interviewing';
            case JobApplicationStatus.Offer: return 'Offer';
            case JobApplicationStatus.Accepted: return 'Accepted';
            case JobApplicationStatus.Rejected: return 'Rejected';
            case JobApplicationStatus.Ghosted: return 'Ghosted';
            default: return 'Unknown';
        }
    }

    getStatusClasses(status: JobApplicationStatus): string {
        const base = 'text-[10px] font-bold uppercase tracking-wider';
        switch (status) {
            case JobApplicationStatus.Applied: return `${base} text-primary`;
            case JobApplicationStatus.PhoneScreen:
            case JobApplicationStatus.TechnicalTask:
            case JobApplicationStatus.Interviewing: return `${base} text-amber-500`;
            case JobApplicationStatus.Offer:
            case JobApplicationStatus.Accepted: return `${base} text-emerald-500`;
            case JobApplicationStatus.Rejected:
            case JobApplicationStatus.Ghosted: return `${base} text-muted-foreground`;
            default: return `${base} text-muted-foreground`;
        }
    }

    getStepClass(status: JobApplicationStatus, step: number): string {
        const depth = this.getStatusDepth(status);
        if (step <= depth) {
            if (status === JobApplicationStatus.Rejected || status === JobApplicationStatus.Ghosted) {
                return 'bg-muted-foreground/30';
            }
            if (status === JobApplicationStatus.Offer || status === JobApplicationStatus.Accepted) {
                return 'bg-emerald-500';
            }
            if (depth > 0 && step < depth) return 'bg-primary/40';
            return 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]';
        }
        return 'bg-secondary';
    }

    getStatusDepth(status: JobApplicationStatus): number {
        switch (status) {
            case JobApplicationStatus.Applied: return 0;
            case JobApplicationStatus.PhoneScreen: return 1;
            case JobApplicationStatus.TechnicalTask: return 2;
            case JobApplicationStatus.Interviewing: return 3;
            case JobApplicationStatus.Offer:
            case JobApplicationStatus.Accepted: return 4;
            case JobApplicationStatus.Rejected:
            case JobApplicationStatus.Ghosted: return 4;
            default: return 0;
        }
    }

    getSalaryClass(salary?: number): string {
        if (!salary) return 'text-muted-foreground/50';
        if (salary > 120000) return 'text-emerald-500 font-bold';
        if (salary > 80000) return 'text-foreground';
        return 'text-muted-foreground';
    }

    getMatchScoreClass(score?: number): string {
        if (!score) return 'bg-muted';
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 50) return 'bg-amber-500';
        return 'bg-slate-400';
    }

    onEdit(event: Event, app: JobApplication): void {
        event.stopPropagation();
        this.router.navigate(['/applications', app.id, 'edit']);
    }

    onArchive(event: Event, app: JobApplication): void {
        event.stopPropagation();
        // Emit archive event or call store directly if allowed
        console.log('Archive', app.id);
    }

    onExternalLink(event: Event, url?: string): void {
        event.stopPropagation();
        if (url) window.open(url, '_blank');
    }
}
