import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill } from '../models/skill.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Skills`;

  constructor(private readonly http: HttpClient) { }

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(this.apiUrl);
  }

  createSkill(payload: { name: string; category?: string }): Observable<Skill> {
    return this.http.post<Skill>(this.apiUrl, payload);
  }
}
