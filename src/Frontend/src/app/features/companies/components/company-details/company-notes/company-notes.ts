import { Component, input, output, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '../../../../../../../libs/ui/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSend, lucideMessageSquare, lucideCommand, lucideHistory, lucideWand2, lucidePencil, lucideSave, lucideFileText, lucideShieldAlert } from '@ng-icons/lucide';

export interface IntelligenceBriefing {
  mission: string;
  fit: string[];
  risks: string;
}

@Component({
  selector: 'app-company-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ...HlmInputImports, NgIcon],
  providers: [provideIcons({ lucideSend, lucideMessageSquare, lucideCommand, lucideHistory, lucideWand2, lucidePencil, lucideSave, lucideFileText, lucideShieldAlert })],
  template: `
    <div class="rounded-3xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800 p-8 flex flex-col h-full group hover:border-zinc-700 transition-all duration-500 shadow-none overflow-hidden relative font-mono text-zinc-300">
      
      <!-- Top Secret Watermarks -->
      <div class="absolute top-10 right-10 opacity-[0.03] select-none pointer-events-none -rotate-12 border-4 border-violet-500 p-4 text-4xl font-black text-violet-500">
        TOP SECRET // INTEL Only
      </div>
      <div class="absolute bottom-1/4 left-10 opacity-[0.02] select-none pointer-events-none -rotate-12 border-2 border-zinc-500 p-2 text-2xl font-black text-zinc-500">
        EYES ONLY
      </div>

      <div class="flex items-center justify-between mb-10 relative z-10">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-violet-400">
            <ng-icon name="lucideFileText" class="h-4 w-4"></ng-icon>
          </div>
          <div>
            <h3 class="text-xs font-black uppercase tracking-[0.3em] text-zinc-100 leading-none">Intelligence Briefing</h3>
            <p class="text-[9px] font-bold text-violet-500/60 uppercase tracking-widest mt-1">Classification: Confidential</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button (click)="handleRegeneration()" [disabled]="isScanning()"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest hover:bg-violet-500/10 transition-all active:scale-95 group/wand disabled:opacity-50 disabled:cursor-not-allowed">
            <ng-icon name="lucideWand2" class="h-3 w-3 group-hover/wand:rotate-12 transition-transform"></ng-icon>
            {{ isScanning() ? 'Scanning...' : 'Regenerate' }}
          </button>
          
          <div class="text-[9px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800">
            Sync: <span class="text-zinc-500">{{ lastUpdated() || 'SESSION_NEW' }}</span>
          </div>
        </div>
      </div>

      <!-- Briefing Body (Structured) -->
      <div class="flex-1 space-y-8 relative z-10 custom-scrollbar overflow-y-auto pr-2 mb-6">
        
        <!-- Section: MISSION CONTEXT -->
        <section class="space-y-3">
          <div class="flex items-center gap-2 text-violet-400/80">
            <div class="h-1 w-4 bg-current"></div>
            <h4 class="text-[10px] font-black uppercase tracking-[0.2em]">[ MISSION CONTEXT ]</h4>
          </div>
          <p class="text-xs leading-relaxed text-zinc-400 indent-4">
            {{ displayedMissionContext() }}
          </p>
        </section>

        <!-- Section: STRATEGIC FIT -->
        @if (mode() === 'full') {
        <section class="space-y-3">
          <div class="flex items-center gap-2 text-emerald-400/80">
            <div class="h-1 w-4 bg-current"></div>
            <h4 class="text-[10px] font-black uppercase tracking-[0.2em]">[ STRATEGIC FIT ]</h4>
          </div>
          <ul class="space-y-2">
            @for (point of displayedStrategicFit(); track $index; let i = $index) {
            <li class="flex gap-3 text-xs text-zinc-400">
              <span class="text-emerald-500/60 leading-none">0{{ i + 1 }}.</span>
              <span class="leading-relaxed">{{ point }}</span>
            </li>
            }
          </ul>
        </section>

        <!-- Section: RISKS & INTEL -->
        <section class="space-y-3">
          <div class="flex items-center gap-2 text-amber-500/80">
            <div class="h-1 w-4 bg-current"></div>
            <h4 class="text-[10px] font-black uppercase tracking-[0.2em]">[ RISKS & INTEL ]</h4>
          </div>
          <div class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
            <ng-icon name="lucideShieldAlert" class="text-amber-500 h-4 w-4 shrink-0"></ng-icon>
            <p class="text-xs leading-relaxed text-zinc-400 italic">
              {{ displayedRisksIntel() }}
            </p>
          </div>
        </section>
        } @else {
         <!-- Compact Mode Summary -->
          <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-800/50">
             <div>
                <h4 class="text-[9px] font-black uppercase tracking-widest text-emerald-500/80 mb-2">Strategic Fit</h4>
                <div class="space-y-1">
                  @for (fit of displayedStrategicFit().slice(0, 2); track $index) {
                     <p class="text-[10px] text-zinc-500 truncate pl-2 border-l border-zinc-800">{{ fit }}</p>
                  }
                </div>
             </div>
             <div>
                <h4 class="text-[9px] font-black uppercase tracking-widest text-amber-500/80 mb-2">Risks Detected</h4>
                 <p class="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {{ displayedRisksIntel() || 'No active risk vectors identified in initial scan.' }}
                </p>
             </div>
          </div>
        }

        <!-- Optional: Field Notes Extension -->
        @if (isEditingNotes()) {
        <section class="mt-10 pt-10 border-t border-zinc-800 space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
           <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-zinc-500">
                <div class="h-1 w-4 bg-current"></div>
                <h4 class="text-[10px] font-black uppercase tracking-[0.2em]">[ FIELD NOTES ]</h4>
              </div>
              <button (click)="isEditingNotes.set(false)" class="text-[9px] font-black uppercase text-violet-400 hover:text-violet-300">Minimize</button>
           </div>
           <textarea hlmInput [ngModel]="notes()" (ngModelChange)="onNotesChange($event)"
            placeholder="Recording field observations..."
            class="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-400 focus:border-violet-500/30 transition-all custom-scrollbar resize-none"></textarea>
        </section>
        }
      </div>

      <!-- Action Footer -->
      <div class="mt-auto pt-6 border-t border-zinc-800 relative z-10 flex items-center justify-between">
        <button (click)="isEditingNotes.set(!isEditingNotes())" 
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:border-zinc-700 transition-all active:scale-95 text-[9px] font-black uppercase tracking-[0.2em]">
          <ng-icon [name]="isEditingNotes() ? 'lucideSave' : 'lucidePencil'" class="h-3 w-3"></ng-icon>
          {{ isEditingNotes() ? 'Save Field Notes' : 'Edit Technical Notes' }}
        </button>

        <div class="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-2">
          Source: <span class="text-violet-500/50">Global AI Grid v4.1</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 999px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyNotesComponent {
  mode = input<'compact' | 'full'>('full');
  notes = input('');
  briefing = input<IntelligenceBriefing | null>(null);
  lastUpdated = input<string | null>(null);

  notesChange = output<string>();
  regenerate = output<void>();

  isScanning = signal(false);
  isEditingNotes = signal(false);

  displayedMissionContext = signal('');
  displayedStrategicFit = signal<string[]>([]);
  displayedRisksIntel = signal('');

  constructor() {
    effect(() => {
      const b = this.briefing();
      if (b) {
        this.runTypewriter(b);
      }
    });
  }

  handleRegeneration(): void {
    this.regenerate.emit();
  }

  runTypewriter(b: IntelligenceBriefing): void {
    this.isScanning.set(true);
    this.displayedMissionContext.set('');
    this.displayedStrategicFit.set([]);
    this.displayedRisksIntel.set('');

    // Start typewriter sequence
    this.typewriter('mission', b.mission).then(() => {
      return this.typewriter('fit', b.fit[0], 0);
    }).then(() => {
      return this.typewriter('fit', b.fit[1], 1);
    }).then(() => {
      return this.typewriter('fit', b.fit[2], 2);
    }).then(() => {
      return this.typewriter('risks', b.risks);
    }).then(() => {
      this.isScanning.set(false);
    });
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
          resolve();
        }
      }, speed);
    });
  }

  onNotesChange(value: string): void {
    this.notesChange.emit(value);
  }
}
