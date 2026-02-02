import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication, CreateJobApplication } from '../models/job-application.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly apiUrl = `${environment.apiBaseUrl}/JobApplications`;

  constructor(private readonly http: HttpClient) { }

  // 1. Lista lekérése
  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

  // 2. Új hozzáadása
  createApplication(application: CreateJobApplication): Observable<any> {
    return this.http.post(this.apiUrl, application);
  }

  // 3. Törlés
  deleteApplication(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 4. Get single application by ID (for editing)
  getApplicationById(id: string): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  // 5. Update application (for editing and status changes)
  updateApplication(id: string, application: Partial<JobApplication>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, application);
  }

  // 6. Trigger AI analysis for a job application
  analyzeJob(id: string): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${this.apiUrl}/${id}/analyze`, {});
  }
}

