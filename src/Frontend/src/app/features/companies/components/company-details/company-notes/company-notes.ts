import { Component, input, output, ChangeDetectionStrategy, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '../../../../../../../libs/ui/input';

@Component({
  selector: 'app-company-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ...HlmInputImports],
  template: `
    <div
      class="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-10 shadow-xl relative min-h-[450px] flex flex-col group hover:border-zinc-700 transition-all">
      <div class="confidential-stamp">EYES ONLY</div>

      <div class="flex items-center gap-3 mb-8">
        <div class="w-2 h-2 rounded-full bg-violet-500/50 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></div>
        <h3 class="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Strategic Scratchpad</h3>
      </div>

      <label for="company-notes-textarea" class="sr-only">Strategic scratchpad notes</label>
      <textarea hlmInput id="company-notes-textarea" [ngModel]="notes()" (ngModelChange)="onNotesChange($event)"
        placeholder="Input operational data, personnel movements, and strategic leverage..."
        class="flex-1 w-full bg-transparent! border-none focus:ring-0 p-0 font-mono text-sm leading-relaxed text-zinc-300 custom-scrollbar resize-none placeholder:text-zinc-700">
      </textarea>

      <div class="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
        <p class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
          Last Encrypted // <span class="text-zinc-500">{{ lastUpdated() || 'SESSION_NEW' }}</span>
        </p>
        <div class="flex items-center gap-2">
          <div class="h-1 w-8 rounded-full bg-violet-500/20 px-0.5 flex items-center">
            <div class="h-full w-1/3 bg-violet-500 rounded-full animate-[shimmer_2s_infinite_linear]"></div>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest text-violet-400 opacity-60">Secure Sync</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confidential-stamp {
      position: absolute;
      top: 2rem;
      right: 2rem;
      font-size: 0.6rem;
      font-weight: 900;
      color: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.1);
      padding: 0.2rem 0.5rem;
      transform: rotate(-15deg);
      pointer-events: none;
      user-select: none;
      letter-spacing: 0.1em;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyNotesComponent {
  notes = input('');
  lastUpdated = input<string | null>(null);
  notesChange = output<string>();

  onNotesChange(value: string): void {
    this.notesChange.emit(value);
  }
}
