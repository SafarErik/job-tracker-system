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
import { ProfileStore } from '../../services/profile.store';
import { toast } from 'ngx-sonner';
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
import { UiStateService } from '../../../../core/services/ui-state.service';

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
  private profileStore = inject(ProfileStore);
  private profileService = inject(ProfileService);
  private skillService = inject(SkillService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  public uiService = inject(UiStateService);

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
  isPolishingBio = signal(false);
  skillSearchTerm = signal('');
  lastSavedField = signal<string | null>(null);

  // AI Signals from Store
  suggestedSkills = this.profileStore.suggestedSkills;
  careerInsights = this.profileStore.careerInsights;

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
    this.loadAISuggestions();

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
      next: (skills) => {
        this.userSkills.set(skills);
        this.profileStore.updateSkills(skills); // Sync with global store
      },
      error: (err) => console.error('Failed to load skills:', err),
    });
  }

  private loadAvailableSkills(): void {
    this.skillService.getSkills().subscribe({
      next: (skills) => this.availableSkills.set(skills),
      error: (err) => console.error('Failed to load available skills:', err),
    });
  }

  private loadAISuggestions(): void {
    // Mocking for now as backend might not have this
    this.profileStore.setSuggestedSkills([
      { id: 9991, name: 'Cloud Architecture', category: 'DevOps' },
      { id: 9992, name: 'Kubernetes', category: 'DevOps' },
      { id: 9993, name: 'Rust', category: 'Backend' }
    ]);

    this.profileStore.setCareerInsights({
      nextLevelPath: 'Lead Engineer roles',
      salaryBenchmark: 145000,
      missingKey: 'Cloud Architecture'
    });

    // In a real scenario:
    /*
    this.profileService.getSuggestedSkills().subscribe(skills => this.profileStore.setSuggestedSkills(skills));
    this.profileService.getCareerInsights().subscribe(insights => this.profileStore.setCareerInsights(insights));
    */
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
      toast.error('Validation Error', {
        description: 'Please enter a valid value',
      });
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
        toast.error('Update Failed', {
          description: 'Failed to update profile.',
        });
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
      toast.error('Invalid File Type', { description: 'Please select a valid image file' });
      input.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File Too Large', { description: 'Image size must not exceed 5MB' });
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
        toast.success('Upload Complete', {
          description: 'Profile picture updated successfully!',
        });
        input.value = '';
      },
      error: (err) => {
        this.isUploadingPicture.set(false);
        toast.error('Upload Failed', { description: 'Failed to upload profile picture' });
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
        const updatedSkills = [
          ...this.userSkills(),
          { id: skill.id, name: skill.name, category: skill.category || 'Other' },
        ];
        this.userSkills.set(updatedSkills);
        this.profileStore.updateSkills(updatedSkills); // Sync with store
        this.skillSearchControl.reset();
        toast.success('Skill Added', {
          description: `${skill.name} has been added to your profile`,
        });
      },
      error: (err) => {
        toast.error('Error', { description: 'Failed to add skill' });
        console.error(err);
      },
    });
  }

  // Simplified custom skill adding
  addCustomSkillFromInput(): void {
    const name = this.skillSearchTerm().trim();
    const category = this.skillCategoryControl.value?.toString().trim();

    if (!name) {
      toast.error('Missing Name', { description: 'Please enter a skill name first' });
      return;
    }

    const lower = name.toLowerCase();
    if (this.userSkills().some((s) => s.name.toLowerCase() === lower)) {
      toast.error('Duplicate', { description: 'You already have this skill' });
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
        toast.success('Skill Added', {
          description: `${userSkill.name} has been added as a new skill`,
        });
      },
      error: (err) => {
        this.isAddingSkill.set(false);
        toast.error('Error', { description: 'Failed to add custom skill' });
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
        const updatedSkills = this.userSkills().filter((s) => s.id !== skill.id);
        this.userSkills.set(updatedSkills);
        this.profileStore.updateSkills(updatedSkills); // Sync with global store
        toast.success('Skill Removed', {
          description: `${skill.name} has been removed from your profile`,
        });
      },
      error: (err) => {
        toast.error('Error', { description: 'Failed to remove skill' });
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

  polishBio(): void {
    const currentBio = this.profileForm.get('bio')?.value;
    if (!currentBio) return;

    this.isPolishingBio.set(true);

    this.profileService.polishBio(currentBio).subscribe({
      next: (res) => {
        this.profileForm.patchValue({ bio: res.polishedBio });
        this.saveField('bio');
        this.isPolishingBio.set(false);
        toast.success('AI Polish Complete', { description: 'Your narrative has been optimized for impact.' });
      },
      error: (err) => {
        this.isPolishingBio.set(false);
        // Fallback or error message
        toast.error('AI Polish Failed', { description: 'System currently unavailable. Try again later.' });
        console.error(err);
      }
    });
  }
}
