import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { SkillService } from '../../../skills/services/skill.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserProfile, ProfileStats, UserSkill } from '../../models/profile.model';
import { Skill } from '../../../skills/models/skill.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private skillService = inject(SkillService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  // State
  profile = signal<UserProfile | null>(null);
  stats = signal<ProfileStats | null>(null);
  userSkills = signal<UserSkill[]>([]);
  availableSkills = signal<Skill[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  isUploadingPicture = signal(false);

  // Form
  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      currentJobTitle: ['', Validators.maxLength(100)],
      yearsOfExperience: [null, [Validators.min(0), Validators.max(50)]],
      bio: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadStats();
    this.loadSkills();
    this.loadAvailableSkills();
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.populateForm(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load profile');
        this.isLoading.set(false);
        console.error(err);
      },
    });
  }

  private loadStats(): void {
    this.profileService.getProfileStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: (err) => console.error('Failed to load stats:', err),
    });
  }

  private loadSkills(): void {
    this.profileService.getUserSkills().subscribe({
      next: (skills) => this.userSkills.set(skills),
      error: (err) => console.error('Failed to load skills:', err),
    });
  }

  private loadAvailableSkills(): void {
    this.skillService.getSkills().subscribe({
      next: (skills) => this.availableSkills.set(skills),
      error: (err) => console.error('Failed to load available skills:', err),
    });
  }

  private populateForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      currentJobTitle: profile.currentJobTitle || '',
      yearsOfExperience: profile.yearsOfExperience,
      bio: profile.bio || '',
    });
  }

  toggleEditMode(): void {
    this.isEditMode.update((mode) => !mode);
    if (!this.isEditMode() && this.profile()) {
      this.populateForm(this.profile()!);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.notificationService.error(
        'Please fill in all required fields correctly',
        'Validation Error',
      );
      return;
    }

    const updateData = this.profileForm.value;

    this.profileService.updateProfile(updateData).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.isEditMode.set(false);
        this.notificationService.success(
          'Your profile has been updated successfully!',
          'Profile Updated',
        );
      },
      error: (err) => {
        this.notificationService.error(
          'Failed to update profile. Please try again.',
          'Update Failed',
        );
        console.error(err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Please select a valid image file', 'Invalid File Type');
      input.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('Image size must not exceed 5MB', 'File Too Large');
      input.value = '';
      return;
    }

    this.isUploadingPicture.set(true);

    this.profileService.uploadProfilePicture(file).subscribe({
      next: (response) => {
        if (this.profile()) {
          this.profile.update((p) => ({ ...p!, profilePictureUrl: response.url }));
        }
        this.isUploadingPicture.set(false);
        this.notificationService.success(
          'Profile picture updated successfully!',
          'Upload Complete',
        );
        input.value = '';
      },
      error: (err) => {
        this.isUploadingPicture.set(false);
        this.notificationService.error('Failed to upload profile picture', 'Upload Failed');
        console.error(err);
        input.value = '';
      },
    });
  }

  get unassignedSkills(): Skill[] {
    const userSkillIds = this.userSkills().map((s) => s.id);
    return this.availableSkills().filter((s) => !userSkillIds.includes(s.id));
  }

  addSkill(skill: Skill): void {
    this.profileService.addSkill(skill.id).subscribe({
      next: () => {
        this.userSkills.update((skills) => [
          ...skills,
          { id: skill.id, name: skill.name, category: skill.category || 'Other' },
        ]);
        this.notificationService.success(
          `${skill.name} has been added to your profile`,
          'Skill Added',
        );
      },
      error: (err) => {
        this.notificationService.error('Failed to add skill', 'Error');
        console.error(err);
      },
    });
  }

  async removeSkill(skill: UserSkill): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `Remove "${skill.name}" from your skills?`,
      'Remove Skill',
    );

    if (!confirmed) return;

    this.profileService.removeSkill(skill.id).subscribe({
      next: () => {
        this.userSkills.update((skills) => skills.filter((s) => s.id !== skill.id));
        this.notificationService.success(
          `${skill.name} has been removed from your profile`,
          'Skill Removed',
        );
      },
      error: (err) => {
        this.notificationService.error('Failed to remove skill', 'Error');
        console.error(err);
      },
    });
  }

  getSkillsByCategory(): { [key: string]: UserSkill[] } {
    const grouped: { [key: string]: UserSkill[] } = {};
    this.userSkills().forEach((skill) => {
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
