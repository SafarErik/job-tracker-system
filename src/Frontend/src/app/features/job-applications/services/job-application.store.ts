import { Injectable, computed, inject, signal } from '@angular/core';
import { JobApplication, CreateJobApplication } from '../models/job-application.model';
import { JobApplicationStatus } from '../models/application-status.enum';
import { ApplicationService } from './application.service';
import { tap, finalize } from 'rxjs/operators';
import { catchError } from 'rxjs';
import { of } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';

export interface JobApplicationState {
    applications: JobApplication[];
    selectedApplicationId: string | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        status: JobApplicationStatus | 'all';
        companyId: string | 'all';
        search: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class JobApplicationStore {
    private readonly applicationService = inject(ApplicationService);
    private readonly notificationService = inject(NotificationService);

    // State Signals
    private readonly _applications = signal<JobApplication[]>([]);
    private readonly _selectedApplicationId = signal<string | null>(null);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Filter Signals
    private readonly _filterStatus = signal<JobApplicationStatus | 'all'>('all');
    private readonly _filterCompanyId = signal<string | 'all'>('all');
    private readonly _filterSearch = signal<string>('');

    // Public Read-only Signals
    readonly applications = this._applications.asReadonly();
    readonly selectedApplicationId = this._selectedApplicationId.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly filterStatus = this._filterStatus.asReadonly();
    readonly filterCompanyId = this._filterCompanyId.asReadonly();
    readonly filterSearch = this._filterSearch.asReadonly();

    // Computed Signals

    /**
     * Currently selected application based on selectedApplicationId
     */
    readonly selectedApplication = computed(() => {
        const id = this._selectedApplicationId();
        if (id === null) return null;
        return this._applications().find((app) => app.id === id) || null;
    });

    /**
     * Filtered list of applications based on all active filters
     */
    readonly filteredApplications = computed(() => {
        const apps = this._applications();
        const status = this._filterStatus();
        const companyId = this._filterCompanyId();
        const search = this._filterSearch().toLowerCase().trim();

        return apps.filter((app) => {
            // 1. Status Filter
            if (status !== 'all' && app.status !== status) return false;

            // 2. Company Filter
            if (companyId !== 'all' && app.companyId !== companyId) return false;

            // 3. Search Filter
            if (search) {
                const matches = [
                    app.position,
                    app.companyName,
                    app.description,
                    app.jobUrl
                ]
                    .filter(Boolean)
                    .some((val) => val!.toLowerCase().includes(search));

                if (!matches) return false;
            }

            return true;
        });
    });

    /**
     * Dashboard Metrics
     */
    readonly metrics = computed(() => {
        const apps = this._applications(); // Use all apps for accurate global metrics

        // Active: Not Rejected or Ghosted
        const activeCount = apps.filter(
            (app) =>
                app.status !== JobApplicationStatus.Rejected &&
                app.status !== JobApplicationStatus.Ghosted
        ).length;

        // Interviewing: Phone Screen, Technical Task, Interviewing
        const interviewCount = apps.filter(
            (app) =>
                app.status === JobApplicationStatus.PhoneScreen ||
                app.status === JobApplicationStatus.TechnicalTask ||
                app.status === JobApplicationStatus.Interviewing
        ).length;

        // Success Rate: Offers / Total (excluding active if desired, but simple definition is fine)
        // If total is 0, rate is 0.
        const offerCount = apps.filter((app) => app.status === JobApplicationStatus.Offer).length;
        const successRate = apps.length > 0 ? Math.round((offerCount / apps.length) * 100) : 0;

        // Response Rate: (Everything except Applied & Ghosted) / Total
        const responseCount = apps.filter(
            (app) =>
                app.status !== JobApplicationStatus.Applied &&
                app.status !== JobApplicationStatus.Ghosted
        ).length;
        const responseRate = apps.length > 0 ? Math.round((responseCount / apps.length) * 100) : 0;

        return {
            total: apps.length,
            active: activeCount,
            interviewing: interviewCount,
            offers: offerCount,
            successRate,
            responseRate
        };
    });

    // Actions

    loadAll() {
        this._isLoading.set(true);
        this._error.set(null);
        this.applicationService.getApplications().pipe(
            tap((apps) => this._applications.set(apps)),
            catchError((err) => {
                console.error('Failed to load applications', err);
                this._error.set('Failed to load applications');
                this.notificationService.error('Could not load applications', 'Error');
                return of([]);
            }),
            finalize(() => this._isLoading.set(false))
        ).subscribe();
    }

    selectApplication(id: string | null) {
        this._selectedApplicationId.set(id);
        if (id !== null) {
            // Logic to ensure details are full if needed, but assuming list provides enough or we fetch details separately
            // Usually smart to fetch fresh details
            this.applicationService.getApplicationById(id).subscribe({
                next: (app) => {
                    // Update the item in the list with fresh details
                    this._applications.update(apps => apps.map(a => a.id === id ? app : a));
                },
                error: (err) => console.error('Failed to refresh application details', err)
            });
        }
    }

    addApplication(application: CreateJobApplication) {
        this._isLoading.set(true);
        // Optimistic? No, creation usually requires backend ID.
        this.applicationService.createApplication(application).subscribe({
            next: (newApp) => {
                this._applications.update((apps) => [...apps, newApp]);
                this.notificationService.success('Application created!', 'Success');
                this._isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to create application', err);
                this.notificationService.error('Failed to create application', 'Error');
                this._isLoading.set(false);
            }
        });
    }

    updateApplication(id: string, changes: Partial<JobApplication>) {
        const originalApps = this._applications();
        const appIndex = originalApps.findIndex(a => a.id === id);
        if (appIndex === -1) return;

        const originalApp = originalApps[appIndex];
        const updatedApp = { ...originalApp, ...changes };

        // Optimistic Update
        this._applications.update(apps => {
            const newApps = [...apps];
            newApps[appIndex] = updatedApp;
            return newApps;
        });

        this.applicationService.updateApplication(id, changes).subscribe({
            next: () => {
                // Success, nothing to do (already updated)
            },
            error: (err) => {
                console.error('Failed to update application', err);
                this.notificationService.error('Update failed, reverting changes', 'Error');
                // Revert
                this._applications.set(originalApps);
            }
        });
    }

    deleteApplication(id: string) {
        const originalApps = this._applications();
        const originalSelectedId = this._selectedApplicationId();

        // Optimistic Update
        this._applications.update(apps => apps.filter(a => a.id !== id));
        if (this._selectedApplicationId() === id) {
            this._selectedApplicationId.set(null);
        }

        this.applicationService.deleteApplication(id).subscribe({
            next: () => {
                this.notificationService.success('Application deleted', 'Success');
            },
            error: (err) => {
                console.error('Failed to delete application', err);
                this.notificationService.error('Delete failed, reverting', 'Error');
                // Revert
                this._applications.set(originalApps);
                this._selectedApplicationId.set(originalSelectedId);
            }
        });
    }

    // Filter Actions
    setSearchTerm(term: string) {
        this._filterSearch.set(term);
    }

    setStatusFilter(status: JobApplicationStatus | 'all') {
        this._filterStatus.set(status);
    }

    setCompanyFilter(companyId: string | 'all') {
        this._filterCompanyId.set(companyId);
    }

    resetFilters() {
        this._filterSearch.set('');
        this._filterStatus.set('all');
        this._filterCompanyId.set('all');
    }
}
