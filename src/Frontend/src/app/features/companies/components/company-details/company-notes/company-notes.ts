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
      class="bg-card rounded-[2.5rem] border border-border/40 p-6 md:p-10 shadow-lg relative min-h-[400px] flex flex-col">
      <div class="confidential-stamp">CONFIDENTIAL</div>

      <div class="flex items-center gap-3 mb-8">
        <div class="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Strategic Scratchpad</h3>
      </div>

      <label for="company-notes-textarea" class="sr-only">Strategic scratchpad notes</label>
      <textarea hlmInput id="company-notes-textarea" [ngModel]="notes()" (ngModelChange)="onNotesChange($event)"
        placeholder="Operational notes, internal intel, and strategic positioning..."
        class="flex-1 w-full !bg-transparent border-none focus:ring-0 p-0 font-mono text-sm leading-loose custom-scrollbar resize-none placeholder:text-muted-foreground/30">
      </textarea>

      <div class="mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 text-center sm:text-left">
          Local Intel
          Store // Encrypted</p>
        <span class="text-[9px] font-black uppercase tracking-widest text-primary">Autosaved</span>
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
      color: hsl(var(--destructive) / 0.2);
      border: 2px solid hsl(var(--destructive) / 0.2);
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
  notesChange = output<string>();

  onNotesChange(value: string): void {
    this.notesChange.emit(value);
  }
}
