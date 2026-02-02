import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobApplicationStore } from '../../services/job-application.store';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBriefcase, lucideTrendingUp, lucideCheckCircle, lucideClock, lucideInbox } from '@ng-icons/lucide';

@Component({
    selector: 'app-application-statbar',
    standalone: true,
    imports: [CommonModule, NgIcon],
    providers: [provideIcons({ lucideBriefcase, lucideTrendingUp, lucideCheckCircle, lucideClock, lucideInbox })],
    templateUrl: './application-statbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationStatbarComponent {
    private readonly store = inject(JobApplicationStore);

    // Computed Stats
    readonly stats = computed(() => {
        const apps = this.store.applications();
        const metrics = this.store.metrics();

        return {
            total: metrics.total,
            active: metrics.active,
            interviews: metrics.interviewing,
            offers: metrics.offers,
            responseRate: metrics.responseRate,
            successRate: metrics.successRate
        };
    });
}
