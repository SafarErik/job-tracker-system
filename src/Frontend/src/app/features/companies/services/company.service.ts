import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize, defer } from 'rxjs';

import { Company, CompanyDetail, CreateCompany, UpdateCompany } from '../models/company.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Companies`;

  // State Signals
  private readonly _companies = signal<Company[]>([]);
  private readonly _activeCompany = signal<CompanyDetail | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Readonly Exposed Signals
  readonly companies = this._companies.asReadonly();
  readonly activeCompany = this._activeCompany.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed Signals
  readonly pipelineProgress = computed(() => {
    // Example computed: Count companies in each status
    // This runs only when companies() changes
    const list = this.companies();
    // Logic can be expanded based on requirements
    return list.length;
  });

  constructor(private readonly http: HttpClient) { }

  /**
   * Load all companies from the API and update the signal
   */
  /**
   * Load all companies from the API and update the signal
   */
  loadCompanies(): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.http.get<Company[]>(this.apiUrl)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (data) => this._companies.set(data),
        error: (err) => {
          console.error('Error loading companies:', err);
          this._error.set('Failed to load companies');
        }
      });
  }

  /**
   * Fetch all companies without updating the store.
   * Use this for forms/dropdowns that need a one-off list.
   */
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  /**
   * Load detailed company information including application history
   * @param id Company ID
   */
  loadCompanyDetails(id: string): void {
    this._isLoading.set(true);
    this._error.set(null);
    // Reset active company while loading new one, or keep old one? Better to clear or show loading.
    // this._activeCompany.set(null); // Optional: clear previous data

    this.http.get<CompanyDetail>(`${this.apiUrl}/${id}/details`)
      .pipe(finalize(() => this._isLoading.set(false)))
      .subscribe({
        next: (data) => this._activeCompany.set(data),
        error: (err) => {
          console.error('Error loading company details:', err);
          this._error.set('Failed to load company details');
        }
      });
  }

  /**
   * Fetch company details without updating the active state store.
   * Use this for forms or background fetching.
   * @param id Company ID
   */
  getCompanyDetails(id: string): Observable<CompanyDetail> {
    return this.http.get<CompanyDetail>(`${this.apiUrl}/${id}/details`);
  }

  /**
   * Create a new company
   * @param company Company data to create
   */
  createCompany(company: CreateCompany): Observable<Company> {
    return defer(() => {
      this._isLoading.set(true);
      return this.http.post<Company>(this.apiUrl, company).pipe(
        tap((newCompany) => {
          // Optimistic update or just append
          this._companies.update(list => [...list, newCompany]);
        }),
        finalize(() => this._isLoading.set(false))
      );
    });

  }

  /**
   * Update an existing company
   * @param id Company ID
   * @param company Company data to update
   */
  updateCompany(id: string, company: UpdateCompany): Observable<void> {
    // We don't set global loading here to avoid freezing the UI for small updates
    // Components can track their own loading state for specific actions if needed
    return this.http.put<void>(`${this.apiUrl}/${id}`, company).pipe(
      tap(() => {
        // Update local state
        this._companies.update(list =>
          list.map(c => c.id === id ? { ...c, ...company } as Company : c)
        );

        // Also update active company if it matches
        const active = this._activeCompany();
        if (active && active.id === id) {
          this._activeCompany.update(current =>
            current ? { ...current, ...company } as CompanyDetail : null
          );
        }
      })
    );
  }

  /**
   * Delete a company
   * @param id Company ID
   */
  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._companies.update(list => list.filter(c => c.id !== id));

        // Clear active if deleted
        if (this._activeCompany()?.id === id) {
          this._activeCompany.set(null);
        }
      })
    );
  }

  // Helper to directly get a company by ID from the store (synchronous)
  getCompanyByIdSync(id: string): Company | undefined {
    return this.companies().find(c => c.id === id);
  }

  /**
   * Clear active company state when navigating away from company detail view.
   * Prevents stale data and reduces memory footprint.
   */
  clearActiveCompany(): void {
    this._activeCompany.set(null);
    this._error.set(null);
  }
}
