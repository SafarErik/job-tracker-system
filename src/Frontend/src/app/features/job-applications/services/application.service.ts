import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication, CreateJobApplication } from '../models/job-application.model';
import { AiGeneratedAssets } from '../../../core/models/ai-generated-assets.model';
import { RefinedJobBrief } from '../../../core/models/fit-review.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly apiUrl = `${environment.apiBaseUrl}/JobApplications`;

  constructor(private readonly http: HttpClient) { }

  /**
   * Fetch all job applications.
   */
  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

  /**
   * Create a new job application.
   */
  createApplication(application: CreateJobApplication): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.apiUrl, application);
  }

  /**
   * Delete an application by ID.
   */
  deleteApplication(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get a single application by ID.
   */
  getApplicationById(id: string): Observable<JobApplication> {
    return this.http.get<JobApplication>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update an existing application partially.
   */
  updateApplication(id: string, application: Partial<JobApplication>): Observable<JobApplication> {
    return this.http.put<JobApplication>(`${this.apiUrl}/${id}`, application);
  }

  /**
   * Trigger AI analysis for a job application.
   */
  analyzeJob(id: string): Observable<JobApplication> {
    return this.http.post<JobApplication>(`${this.apiUrl}/${id}/analyze`, {});
  }

  /**
   * Ask AI to clean and structure a pasted job description.
   */
  refineJobBrief(id: string, description: string): Observable<RefinedJobBrief> {
    return this.http.post<RefinedJobBrief>(`${this.apiUrl}/${id}/brief/refine`, { description });
  }

  /**
   * Generate tailored resume and cover letter assets.
   */
  generateAssets(id: string): Observable<AiGeneratedAssets> {
    return this.http.post<AiGeneratedAssets>(`${this.apiUrl}/${id}/generate-assets`, {});
  }

  /**
   * Generate a tailored cover letter only.
   */
  generateCoverLetter(id: string): Observable<{ content: string }> {
    return this.http.post<{ content: string }>(`${this.apiUrl}/${id}/cover-letter`, {});
  }

  /**
   * Optimize resume for a specific job application.
   */
  optimizeResume(id: string): Observable<{ content: string }> {
    return this.http.post<{ content: string }>(`${this.apiUrl}/${id}/resume-optimize`, {});
  }
}

