import { Injectable, inject, signal, computed } from '@angular/core';
import { CompanyService } from './company.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Company, CompanyDetail } from '../models/company.model';
import { CompanyPriority } from '../models/company-priority.enum';
import type { CreateCompany, UpdateCompany } from '../models/company.model';
import { finalize, tap } from 'rxjs/operators';
import { catchError, of, Observable } from 'rxjs';

/**
 * CompanyStore — centralised state management for the companies feature.
 *
 * Follows the same Store pattern as `JobApplicationStore` and `DocumentStore`:
 *  - Private writable signals for state
 *  - Public readonly signals for consumers
 *  - Action methods that delegate HTTP to `CompanyService`
 */
@Injectable({ providedIn: 'root' })
export class CompanyStore {
    private readonly companyService = inject(CompanyService);
    private readonly notificationService = inject(NotificationService);

    // ── State Signals ──────────────────────────────────────

    private readonly _companies = signal<Company[]>([]);
    private readonly _activeCompany = signal<CompanyDetail | null>(null);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _isScanning = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // ── Public Read-only Signals ───────────────────────────

    readonly companies = this._companies.asReadonly();
    readonly activeCompany = this._activeCompany.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly isScanning = this._isScanning.asReadonly();
    readonly error = this._error.asReadonly();

    // ── Computed Signals ───────────────────────────────────

    /** Total number of tracked companies */
    readonly totalCount = computed(() => this._companies().length);

    /** Companies with at least one application */
    readonly activePursuits = computed(() =>
        this._companies().filter(c => c.totalApplications > 0).length,
    );

    /** Top-tier companies */
    readonly topTierCount = computed(() =>
        this._companies().filter(c => c.priority === CompanyPriority.TopTier).length,
    );

    // ── Actions ────────────────────────────────────────────

    /** Load all companies from the API */
    loadAll(): void {
        this._isLoading.set(true);
        this._error.set(null);

        this.companyService
            .getCompanies()
            .pipe(
                tap(data => this._companies.set(data)),
                catchError(err => {
                    this._error.set('Failed to load companies');
                    this.notificationService.error('Could not load companies', 'Error');
                    return of([]);
                }),
                finalize(() => this._isLoading.set(false)),
            )
            .subscribe();
    }

    /** Load detailed company information for the detail view */
    loadDetails(id: string): void {
        this._isLoading.set(true);
        this._error.set(null);

        this.companyService
            .getCompanyDetails(id)
            .pipe(
                tap(data => this._activeCompany.set(data)),
                catchError(err => {
                    this._error.set('Failed to load company details');
                    this.notificationService.error('Could not load company details', 'Error');
                    return of(null);
                }),
                finalize(() => this._isLoading.set(false)),
            )
            .subscribe();
    }

    /** Create a new company and append to the list */
    create(company: CreateCompany): Observable<Company> {
        this._isLoading.set(true);

        return this.companyService.createCompany(company).pipe(
            tap(newCompany => {
                this._companies.update(list => [...list, newCompany]);
                this.notificationService.success('Company created!', 'Success');
                this._isLoading.set(false);
            }),
            catchError(err => {
                this.notificationService.error('Failed to create company', 'Error');
                this._isLoading.set(false);
                throw err;
            })
        );
    }

    /** Update a company with optimistic local update */
    update(id: string, changes: UpdateCompany): void {
        const originalList = this._companies();
        const originalActive = this._activeCompany();

        // Optimistic update
        this._companies.update(list =>
            list.map(c => (c.id === id ? ({ ...c, ...changes } as Company) : c)),
        );

        if (originalActive?.id === id) {
            this._activeCompany.update(current =>
                current ? ({ ...current, ...changes } as CompanyDetail) : null,
            );
        }

        this.companyService.updateCompany(id, changes).subscribe({
            next: () => {
                // Success — optimistic update stays
            },
            error: () => {
                this.notificationService.error('Update failed, reverting changes', 'Error');
                this._companies.set(originalList);
                this._activeCompany.set(originalActive);
            },
        });
    }

    /** Delete a company with optimistic removal */
    delete(id: string): void {
        const originalList = this._companies();

        // Optimistic delete
        this._companies.update(list => list.filter(c => c.id !== id));
        if (this._activeCompany()?.id === id) {
            this._activeCompany.set(null);
        }

        this.companyService.deleteCompany(id).subscribe({
            next: () => {
                this.notificationService.success('Company deleted', 'Success');
            },
            error: () => {
                this.notificationService.error('Delete failed, reverting', 'Error');
                this._companies.set(originalList);
            },
        });
    }

    /** Scout a company using the AI Intelligence Engine */
    scout(url: string): void {
        this._isScanning.set(true);
        this._error.set(null);

        this.companyService.scoutCompany(url).subscribe({
            next: result => {
                this._isScanning.set(false);
                this.notificationService.success('Company scouted successfully!', 'Intel Gathered');
                // Reload to show the newly scouted company
                this.loadAll();
            },
            error: () => {
                this._isScanning.set(false);
                this._error.set('Scout operation failed');
                this.notificationService.error('Scout operation failed', 'Error');
            },
        });
    }

    /**
     * Clear active company state when navigating away from detail view.
     * Prevents stale data and reduces memory footprint.
     */
    clearActiveCompany(): void {
        this._activeCompany.set(null);
        this._error.set(null);
    }
}
