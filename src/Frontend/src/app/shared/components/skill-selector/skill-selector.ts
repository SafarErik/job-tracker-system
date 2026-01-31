import { Component, OnInit, signal, inject, computed, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SkillService } from '../../../features/skills/services/skill.service';
import { Skill } from '../../../features/skills/models/skill.model';
import { trigger, transition, style, animate } from '@angular/animations';

// Spartan UI Imports
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCommandImports } from '@spartan-ng/helm/command';
import { BrnCommandImports } from '@spartan-ng/brain/command';

// Icons
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucidePlus, lucideSearch, lucideX, lucideGraduationCap, lucideCheck } from '@ng-icons/lucide';

@Component({
    selector: 'app-skill-selector',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ...HlmInputImports,
        ...HlmButtonImports,
        ...HlmCommandImports,
        ...BrnCommandImports,
        NgIcon
    ],
    providers: [
        provideIcons({ lucidePlus, lucideSearch, lucideX, lucideGraduationCap, lucideCheck })
    ],
    template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold flex items-center gap-2">
          <ng-icon name="lucideGraduationCap" class="h-4 w-4 text-primary"></ng-icon>
          {{ title() }}
        </h2>
        <span class="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{{ selectedSkills().length }} Active</span>
      </div>

      <!-- Search Bar (Spartan Command) -->
      <hlm-command class="rounded-xl border border-input bg-background shadow-sm overflow-hidden min-h-[300px]">
        <hlm-command-search class="border-b border-border">
          <ng-icon hlm name="lucideSearch" class="ml-2 h-4 w-4 text-muted-foreground"></ng-icon>
          <input hlm-command-search-input [formControl]="searchControl"
            [placeholder]="placeholder()" class="text-sm" />
        </hlm-command-search>

        <!-- Active Stack -->
        <div class="p-4 bg-muted/20 border-b border-border/40 space-y-3 min-h-[60px]">
          <div class="flex items-center justify-between">
            <h4 class="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Stack</h4>
            <span class="text-[9px] text-muted-foreground/60 uppercase font-bold">Click to remove</span>
          </div>

          <div class="flex flex-wrap gap-2">
            @for (skill of selectedSkills(); track skill) {
            <div @fadeScale
              class="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/5 text-primary border border-primary/20 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all select-none"
              (click)="removeSkill(skill)" title="Remove {{ skill }}">
              {{ skill }}
              <ng-icon name="lucideX"
                class="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"></ng-icon>
            </div>
            }
            @if (selectedSkills().length === 0) {
            <span class="text-xs text-muted-foreground/50 italic py-2">Start typing above to build the stack...</span>
            }
          </div>
        </div>

        <div *brnCommandEmpty hlmCommandEmpty class="py-6 px-4 text-center text-xs text-muted-foreground">
          No matches found. Press Enter to add custom skill.
        </div>

        <hlm-command-list class="max-h-[200px] overflow-y-auto">
          <hlm-command-group *ngIf="filteredSuggestions().length > 0">
            @for (skill of filteredSuggestions().slice(0, 8); track skill.id) {
            <button hlm-command-item [value]="skill.name"
              (selected)="addSkill(skill.name)">
              <ng-icon name="lucidePlus" hlm class="mr-2 h-4 w-4 text-primary"></ng-icon>
              {{ skill.name }}
            </button>
            }
          </hlm-command-group>

          <!-- Custom Add Action if no match -->
          @if (filteredSuggestions().length === 0 && searchControl.value?.trim()) {
          <hlm-command-group>
            <button hlm-command-item [value]="searchControl.value || ''" (selected)="addCustomSkill()">
              <ng-icon name="lucidePlus" hlm class="mr-2 h-4 w-4 text-primary"></ng-icon>
              Add "{{ searchControl.value }}"
            </button>
          </hlm-command-group>
          }
        </hlm-command-list>
      </hlm-command>

      <!-- Quick Suggestions (Top suggested skills not yet added) -->
      @if (suggestions().length > 0) {
      <div class="space-y-2">
        <div class="text-[9px] uppercase font-black text-muted-foreground/60 tracking-[0.2em]">Recommendations</div>
        <div class="flex flex-wrap gap-2">
          @for (skill of suggestions().slice(0, 6); track skill.id) {
          <button (click)="addSkill(skill.name)"
            class="px-2.5 py-1 text-[10px] font-black uppercase rounded-full bg-secondary/40 text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
            + {{ skill.name }}
          </button>
          }
        </div>
      </div>
      }
    </div>
  `,
    animations: [
        trigger('fadeScale', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('0.2s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillSelectorComponent implements OnInit {
    private readonly skillService = inject(SkillService);

    // Inputs
    selectedSkills = input<string[]>([]);
    title = input<string>('Skills Engine');
    placeholder = input<string>('Add a skill (e.g. React)...');

    // Outputs
    skillAdded = output<string>();
    skillRemoved = output<string>();

    // State
    availableSkills = signal<Skill[]>([]);
    searchControl = new FormControl('');

    // Computed
    unassignedSkills = computed(() => {
        const selected = this.selectedSkills().map(s => s.toLowerCase());
        return this.availableSkills().filter(s => !selected.includes(s.name.toLowerCase()));
    });

    filteredSuggestions = computed(() => {
        const term = this.searchControl.value?.trim().toLowerCase() || '';
        if (!term) return this.unassignedSkills();
        return this.unassignedSkills().filter(s => s.name.toLowerCase().includes(term));
    });

    suggestions = computed(() => {
        // Just show a few from the pool to suggest
        return this.unassignedSkills();
    });

    ngOnInit(): void {
        this.loadSkills();
    }

    loadSkills(): void {
        this.skillService.getSkills().subscribe({
            next: (skills) => this.availableSkills.set(skills),
            error: (err) => console.error('Failed to load skills:', err)
        });
    }

    addSkill(name: string): void {
        const term = name.trim();
        if (!term) return;

        const exists = this.selectedSkills().some(s => s.toLowerCase() === term.toLowerCase());
        if (exists) return;

        this.skillAdded.emit(term);
        this.searchControl.setValue('');
    }

    addCustomSkill(): void {
        const name = this.searchControl.value?.trim();
        if (!name) return;

        // Check if it already exists globally
        const existingGlobal = this.availableSkills().find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existingGlobal) {
            this.addSkill(existingGlobal.name);
            return;
        }

        // Create globally first? No, we can just emit the name and let the parent handle persistence if needed,
        // OR it persists itself. Better to let parent decide, but for UX, we should add it to the global list too.
        this.skillService.createSkill({ name }).subscribe({
            next: (newSkill) => {
                this.availableSkills.update(skills => [...skills, newSkill]);
                this.addSkill(newSkill.name);
            },
            error: () => {
                // Fallback: just emit the name if creation fails (though it shouldn't)
                this.addSkill(name);
            }
        });
    }

    removeSkill(skill: string): void {
        this.skillRemoved.emit(skill);
    }
}
