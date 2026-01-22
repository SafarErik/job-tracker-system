import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, CompanyDetail, CreateCompany, UpdateCompany } from '../models/company.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Companies`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Get all companies with basic information
   */
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  /**
   * Get detailed company information including application history
   * @param id Company ID
   */
  getCompanyDetails(id: number): Observable<CompanyDetail> {
    return this.http.get<CompanyDetail>(`${this.apiUrl}/${id}/details`);
  }

  /**
   * Get basic company information by ID
   * @param id Company ID
   */
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new company
   * @param company Company data to create
   */
  createCompany(company: CreateCompany): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);
  }

  /**
   * Update an existing company
   * @param id Company ID
   * @param company Company data to update
   */
  updateCompany(id: number, company: UpdateCompany): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, company);
  }

  /**
   * Delete a company
   * @param id Company ID
   */
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
