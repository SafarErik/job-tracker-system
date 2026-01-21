import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  UserProfile,
  UpdateProfileRequest,
  ProfileStats,
  UserSkill,
} from '../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/Profile`;

  /**
   * Get current user's profile
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  /**
   * Update current user's profile
   */
  updateProfile(profile: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, profile);
  }

  /**
   * Get profile statistics
   */
  getProfileStats(): Observable<ProfileStats> {
    return this.http.get<ProfileStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Get user's skills
   */
  getUserSkills(): Observable<UserSkill[]> {
    return this.http.get<UserSkill[]>(`${this.apiUrl}/skills`);
  }

  /**
   * Add skill to user profile
   */
  addSkill(skillId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/skills/${skillId}`, {});
  }

  /**
   * Remove skill from user profile
   */
  removeSkill(skillId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/skills/${skillId}`);
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-picture`, formData);
  }
}
