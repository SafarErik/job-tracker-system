import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Company, CompanyDetail, CreateCompany, UpdateCompany } from '../models/company.model';
import { environment } from '../../../../environments/environment';

/**
 * CompanyService — pure HTTP client for company API endpoints.
 *
 * All state management has been moved to `CompanyStore`.
 * This service only handles HTTP transport.
 */
@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/Companies`;

  /** Fetch all companies */
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  /** Fetch detailed company information including contacts and application history */
  getCompanyDetails(id: string): Observable<CompanyDetail> {
    return this.http.get<CompanyDetail>(`${this.apiUrl}/${id}/details`);
  }

  /** Create a new company */
  createCompany(company: CreateCompany): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  /** Update an existing company */
  updateCompany(id: string, company: UpdateCompany): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, company);
  }

  /** Delete a company */
  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Scout a company using the AI Intelligence Engine */
  scoutCompany(url: string): Observable<ScoutedCompanyDto> {
    return this.http.post<ScoutedCompanyDto>(`${this.apiUrl}/scout`, { url });
  }
}

/**
 * Response from the company scout endpoint.
 * Matches backend `ScoutedCompanyDto`.
 */
export interface ScoutedCompanyDto {
  companyName: string;
  industry?: string;
  description?: string;
  hqLocation?: string;
  techStack: string[];
  compatibilityScore: number;
  risks: string[];
  success: boolean;
  errorMessage?: string;
}
