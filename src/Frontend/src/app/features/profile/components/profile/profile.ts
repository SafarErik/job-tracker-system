import { Component, OnInit, signal, inject, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { SkillService } from '../../../skills/services/skill.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserProfile, ProfileStats, UserSkill } from '../../models/profile.model';
import { Skill } from '../../../skills/models/skill.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { trigger, transition, style, animate, state } from '@angular/animations';

// Spartan UI Imports
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';

// Icons
import { provideIcons, NgIcon } from '@ng-icons/core';
import {
  lucideUserX,
  lucideLoader2,
  lucidePencil,
  lucideSave,
  lucideTrash2,
  lucidePlus,
  lucideSearch,
  lucideX,
  lucideUserPen,
  lucideGraduationCap,
  lucideTarget,
  lucideSparkles,
  lucideCheck,
  lucideChevronDown,
  lucideMail,
  lucideBriefcase,
  lucideMapPin
} from '@ng-icons/lucide';

// Shared
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmComboboxImports,
    ...HlmCommandImports,
    ...BrnCommandImports,
    NgIcon,
    ErrorStateComponent
  ],
  providers: [
    provideIcons({
      lucideUserX,
      lucideLoader2,
      lucidePencil,
      lucideSave,
      lucideTrash2,
      lucidePlus,
      lucideSearch,
      lucideX,
      lucideUserPen,
      lucideGraduationCap,
      lucideTarget,
      lucideSparkles,
      lucideCheck,
      lucideChevronDown,
      lucideMail,
      lucideBriefcase,
      lucideMapPin
    })
  ],
  templateUrl: './profile.html',
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.2s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private skillService = inject(SkillService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // State
  profile = signal<UserProfile | null>(null);
  stats = signal<ProfileStats | null>(null);
  userSkills = signal<UserSkill[]>([]);
  availableSkills = signal<Skill[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Inline Editing State
  editingField = signal<string | null>(null);
  isUploadingPicture = signal(false);
  isAddingSkill = signal(false);
  skillSearchTerm = signal('');
  lastSavedField = signal<string | null>(null);

  // Top suggested skills not yet added
  topSkills = computed(() => {
    // Just take the first 5 unassigned skills for now as "Suggestions"
    return this.unassignedSkills.slice(0, 5);
  });

  // Form
  profileForm: FormGroup;
  skillSearchControl = new FormControl('');
  skillCategoryControl = new FormControl('');

  // Computed State for Profile Completeness
  completenessPercentage = computed(() => {
    const p = this.profile();
    if (!p) return 0;

    let score = 0;
    let total = 6; // First, Last, Title, Bio, Exp, Picture, Skills (we'll count skills separately or weighted)

    if (p.firstName) score++;
    if (p.lastName) score++;
    if (p.currentJobTitle) score++;
    if (p.bio) score++;
    if (p.yearsOfExperience != null) score++;
    if (p.profilePictureUrl) score++;

    // Bonus for skills
    if (this.userSkills().length > 0) score++;
    total++;

    return Math.round((score / total) * 100);
  });

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

    this.skillSearchControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.skillSearchTerm.set(term?.toString() ?? '');
      });
  }

  loadProfile(): void {
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

  startEditing(field: string): void {
    this.editingField.set(field);
    // Focus logic could go here via a directive or ViewChild, but HTML autofocus usually works
  }

  cancelEditing(): void {
    this.editingField.set(null);
    if (this.profile()) {
      this.populateForm(this.profile()!);
    }
  }

  saveField(field: string): void {
    const control = this.profileForm.get(field);

    if (control?.invalid) {
      this.notificationService.error(
        'Please enter a valid value',
        'Validation Error',
      );
      return;
    }

    const value = control?.value;
    const currentProfile = this.profile();

    // Optimistic update check - skip if no change
    // @ts-ignore
    if (currentProfile && currentProfile[field as keyof UserProfile] === value) {
      this.editingField.set(null);
      return;
    }

    // Prepare update payload
    // We send the whole form value to ensure consistency, 
    // or we could construct a partial object if the API supported PATCH properly
    const updateData = this.profileForm.value;

    this.profileService.updateProfile(updateData).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.editingField.set(null);
        this.lastSavedField.set(field);

        // Show checkmark briefly
        setTimeout(() => this.lastSavedField.set(null), 2000);
      },
      error: (err) => {
        this.notificationService.error(
          'Failed to update profile.',
          'Update Failed',
        );
        console.error(err);
        // Revert form
        if (this.profile()) this.populateForm(this.profile()!);
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

  // Used for filtering in the combobox command
  get filteredSkills(): Skill[] {
    const term = this.skillSearchTerm().trim().toLowerCase();
    const pool = this.unassignedSkills;
    if (!term) return pool;
    return pool.filter((s) => s.name.toLowerCase().includes(term));
  }

  get addableSkillName(): string | null {
    const term = this.skillSearchTerm().trim();
    if (!term) return null;
    const lower = term.toLowerCase();
    const existsUser = this.userSkills().some((s) => s.name.toLowerCase() === lower);
    const existsAvailable = this.availableSkills().some((s) => s.name.toLowerCase() === lower);
    if (existsUser || existsAvailable) return null;
    return term;
  }

  addSkill(skill: Skill): void {
    this.profileService.addSkill(skill.id).subscribe({
      next: () => {
        this.userSkills.update((skills) => [
          ...skills,
          { id: skill.id, name: skill.name, category: skill.category || 'Other' },
        ]);
        this.skillSearchControl.reset();
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

  // Simplified custom skill adding
  addCustomSkillFromInput(): void {
    const name = this.skillSearchTerm().trim();
    const category = this.skillCategoryControl.value?.toString().trim();

    if (!name) {
      this.notificationService.error('Please enter a skill name first', 'Missing Name');
      return;
    }

    const lower = name.toLowerCase();
    if (this.userSkills().some((s) => s.name.toLowerCase() === lower)) {
      this.notificationService.error('You already have this skill', 'Duplicate');
      return;
    }

    this.isAddingSkill.set(true);

    this.profileService.addCustomSkill({ name, category: category || undefined }).subscribe({
      next: (skill) => {
        const userSkill: UserSkill = {
          id: skill.id,
          name: skill.name,
          category: skill.category || 'Other',
        };
        this.userSkills.update((skills) => [...skills, userSkill]);
        this.availableSkills.update((skills) => [
          ...skills,
          { id: skill.id, name: skill.name, category: skill.category },
        ]);
        this.skillSearchControl.setValue('');
        this.skillCategoryControl.setValue('');
        this.isAddingSkill.set(false);
        this.notificationService.success(
          `${userSkill.name} has been added as a new skill`,
          'Skill Added',
        );
      },
      error: (err) => {
        this.isAddingSkill.set(false);
        this.notificationService.error('Failed to add custom skill', 'Error');
        console.error(err);
      },
    });
  }

  onSkillInputEnter(): void {
    if (this.filteredSkills.length > 0) {
      this.addSkill(this.filteredSkills[0]);
      return;
    }

    if (this.addableSkillName) {
      this.addCustomSkillFromInput();
    }
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
      // Default to 'Other' if category is null or undefined
      const category = skill.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
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
