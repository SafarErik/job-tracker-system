import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApplication, CreateJobApplication } from '../models/job-application.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly apiUrl = 'http://localhost:5433/api/JobApplications';

  constructor(private readonly http: HttpClient) {}

  // 1. Lista lekérése
  getApplications(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>(this.apiUrl);
  }

  // 2. Új hozzáadása
  createApplication(application: CreateJobApplication): Observable<any> {
    return this.http.post(this.apiUrl, application);
  }

  // 3. Törlés
  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
