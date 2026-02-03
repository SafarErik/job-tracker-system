import { Injectable, computed, inject, signal } from '@angular/core';
import { ProfileService } from './profile.service';
import { UserProfile, UserSkill } from '../models/profile.model';
import { tap, finalize } from 'rxjs/operators';
import { catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProfileStore {
    private readonly profileService = inject(ProfileService);

    // State Signals
    private readonly _profile = signal<UserProfile | null>(null);
    private readonly _userSkills = signal<UserSkill[]>([]);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Public Read-only Signals
    readonly profile = this._profile.asReadonly();
    readonly userSkills = this._userSkills.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();

    /**
     * Computed signal for easy skill name lookup (case-insensitive)
     */
    readonly skillNames = computed(() =>
        this._userSkills().map(s => s.name.toLowerCase())
    );

    /**
     * Check if user has a specific skill
     */
    hasSkill(skillName: string): boolean {
        const name = skillName.toLowerCase().trim();
        return this.skillNames().includes(name);
    }

    /**
     * Load profile data and skills
     */
    loadProfile() {
        this._isLoading.set(true);
        this._error.set(null);

        // Initial load of profile
        this.profileService.getProfile().pipe(
            tap(profile => this._profile.set(profile)),
            catchError(err => {
                console.error('Failed to load profile', err);
                this._error.set('Failed to load profile');
                return of(null);
            })
        ).subscribe();

        // Load skills
        this.profileService.getUserSkills().pipe(
            tap(skills => this._userSkills.set(skills)),
            catchError(err => {
                console.error('Failed to load user skills', err);
                return of([]);
            }),
            finalize(() => this._isLoading.set(false))
        ).subscribe();
    }

    /**
     * Update internal skills state (used after mutations in services)
     */
    updateSkills(skills: UserSkill[]) {
        this._userSkills.set(skills);
    }
}
