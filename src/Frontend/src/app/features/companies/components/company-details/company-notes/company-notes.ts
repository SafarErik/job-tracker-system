import { Component, input, output, ChangeDetectionStrategy, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '../../../../../../../libs/ui/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSend, lucideMessageSquare, lucideCommand, lucideHistory, lucideWand2, lucidePencil, lucideSave, lucideFileText, lucideShieldAlert, lucideMaximize2, lucideX } from '@ng-icons/lucide';

export interface IntelligenceBriefing {
  mission: string;
  fit: string[];
  risks: string;
}

@Component({
  selector: 'app-company-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ...HlmInputImports, NgIcon],
  providers: [provideIcons({ lucideSend, lucideMessageSquare, lucideCommand, lucideHistory, lucideWand2, lucidePencil, lucideSave, lucideFileText, lucideShieldAlert, lucideMaximize2, lucideX })],
  templateUrl: './company-notes.html',
  styleUrls: ['./company-notes.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyNotesComponent {
  private readonly destroyRef = inject(DestroyRef);
  private activeIntervals: ReturnType<typeof setInterval>[] = [];
  private previousActiveElement: HTMLElement | null = null;

  mode = input<'compact' | 'full'>('full');
  notes = input('');
  briefing = input<IntelligenceBriefing | null>(null);
  lastUpdated = input<string | null>(null);

  notesChange = output<string>();
  regenerate = output<void>();

  isScanning = signal(false);
  isEditingNotes = signal(false);
  isBriefingExpanded = signal(false);

  displayedMissionContext = signal('');
  displayedStrategicFit = signal<string[]>([]);
  displayedRisksIntel = signal('');



  handleRegeneration(): void {
    this.regenerate.emit();
  }

  toggleExpansion(): void {
    this.isBriefingExpanded.update(v => !v);
  }

  // Listen for Escape key to close expansion
  // Note: Using window binding since focus might be anywhere
  constructor() {
    // Clean up intervals when component is destroyed
    this.destroyRef.onDestroy(() => this.clearAllIntervals());

    effect((onCleanup) => {
      const expanded = this.isBriefingExpanded();
      if (expanded) {
        this.previousActiveElement = document.activeElement as HTMLElement;
        document.body.style.overflow = 'hidden';

        // Focus Trap and Escape Handler
        const handleKeydown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            this.toggleExpansion();
            return;
          }

          if (e.key === 'Tab') {
            const modal = document.querySelector('[role="dialog"]');
            if (modal) {
              const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
              const first = focusable[0] as HTMLElement;
              const last = focusable[focusable.length - 1] as HTMLElement;

              if (e.shiftKey) {
                if (document.activeElement === first) {
                  last.focus();
                  e.preventDefault();
                }
              } else {
                if (document.activeElement === last) {
                  first.focus();
                  e.preventDefault();
                }
              }
            }
          }
        };

        window.addEventListener('keydown', handleKeydown);

        // Move focus into modal
        setTimeout(() => {
          const closeBtn = document.querySelector('[aria-label="Close briefing"]');
          (closeBtn as HTMLElement)?.focus();
        }, 50);

        onCleanup(() => {
          document.body.style.overflow = 'auto';
          window.removeEventListener('keydown', handleKeydown);
          this.previousActiveElement?.focus();
        });
      } else {
        document.body.style.overflow = 'auto';
      }
    });

    effect(() => {
      const b = this.briefing();
      if (b) {
        this.runTypewriter(b);
      }
    });
  }

  async runTypewriter(b: IntelligenceBriefing): Promise<void> {
    // Clear any existing intervals to prevent memory leak
    this.clearAllIntervals();

    this.isScanning.set(true);
    this.displayedMissionContext.set('');
    this.displayedStrategicFit.set([]);
    this.displayedRisksIntel.set('');

    // Safely iterate over mission context
    await this.typewriter('mission', b.mission);

    // Safely iterate over each fit point
    if (b.fit && Array.isArray(b.fit)) {
      for (let i = 0; i < b.fit.length; i++) {
        await this.typewriter('fit', b.fit[i], i);
      }
    }

    // Safely iterate over risks
    await this.typewriter('risks', b.risks);

    this.isScanning.set(false);
  }

  private typewriter(section: 'mission' | 'fit' | 'risks', text: string, index?: number): Promise<void> {
    return new Promise((resolve) => {
      let current = '';
      const speed = 15;
      const interval = setInterval(() => {
        if (current.length < text.length) {
          current += text.charAt(current.length);
          if (section === 'mission') this.displayedMissionContext.set(current);
          if (section === 'risks') this.displayedRisksIntel.set(current);
          if (section === 'fit' && index !== undefined) {
            this.displayedStrategicFit.update(prev => {
              const next = [...prev];
              next[index] = current;
              return next;
            });
          }
        } else {
          clearInterval(interval);
          this.removeInterval(interval);
          resolve();
        }
      }, speed);
      this.activeIntervals.push(interval);
    });
  }

  private clearAllIntervals(): void {
    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeIntervals = [];
  }

  private removeInterval(interval: ReturnType<typeof setInterval>): void {
    const idx = this.activeIntervals.indexOf(interval);
    if (idx > -1) this.activeIntervals.splice(idx, 1);
  }

  onNotesChange(value: string): void {
    this.notesChange.emit(value);
  }
}
