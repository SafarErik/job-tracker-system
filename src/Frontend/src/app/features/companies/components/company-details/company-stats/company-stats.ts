import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';
import { SkillSelectorComponent } from '../../../../../shared/components/skill-selector/skill-selector';

@Component({
  selector: 'app-company-stats',
  standalone: true,
  imports: [CommonModule, NgIcon, SkillSelectorComponent],
  providers: [provideIcons({ lucideTrendingUp, lucideTrendingDown })],
  template: `
    <div class="space-y-6">
      <!-- High-Level Asset Metrics -->
      <div class="grid grid-cols-1 gap-4">
        <div class="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 group hover:border-violet-500/30 transition-all duration-500 relative overflow-hidden">
           <div class="absolute -right-4 -top-4 w-16 h-16 bg-violet-500/5 blur-2xl rounded-full"></div>
           <div class="relative z-10 flex items-center justify-between">
              <div>
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Engagement</p>
                <h4 class="text-3xl font-serif text-zinc-100 leading-none">{{ totalApplications() }}</h4>
              </div>
              <div class="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-violet-400 transition-colors">
                <ng-icon name="lucideTrendingUp" class="h-5 w-5"></ng-icon>
              </div>
           </div>
        </div>

        <div class="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
           <div class="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 blur-2xl rounded-full"></div>
           <div class="relative z-10 flex items-center justify-between">
              <div>
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Mission Yield</p>
                <h4 class="text-3xl font-serif text-zinc-100 leading-none">{{ successRate() }}%</h4>
              </div>
              <div class="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-emerald-400 transition-colors">
                <ng-icon name="lucideTrendingUp" class="h-5 w-5"></ng-icon>
              </div>
           </div>
        </div>
      </div>

      <!-- Tactical Stack: Compact Operational Info -->
      <div class="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden flex flex-col">
        <div class="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/20">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-100 flex items-center gap-2 leading-none">
            <div class="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
            Tactical Stack
          </h3>
          <span class="text-[9px] font-bold text-zinc-600 uppercase">{{ techStack().length }} Tools</span>
        </div>
        
        <div class="p-4 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
          @for (tech of techStack(); track tech) {
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800 group/item hover:border-zinc-700 transition-all">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 group-hover/item:text-violet-400 transition-colors">
                {{ tech.charAt(0) }}
              </div>
              <span class="text-xs font-semibold text-zinc-300 group-hover/item:text-zinc-100 transition-colors">{{ tech }}</span>
            </div>
            <button (click)="techRemove.emit(tech)" 
              class="opacity-0 group-hover/item:opacity-100 h-6 w-6 rounded-md bg-zinc-900 text-zinc-500 hover:text-destructive transition-all flex items-center justify-center">
              <ng-icon name="lucideTrendingDown" class="h-3 w-3 rotate-45"></ng-icon>
            </button>
          </div>
          }
          @if (techStack().length === 0) {
          <div class="py-10 text-center opacity-20">
            <p class="text-[10px] font-black uppercase tracking-widest">No Intelligence Gathered</p>
          </div>
          }
        </div>
        
        <div class="p-4 bg-zinc-950/30">
          <app-skill-selector [compact]="true" [hideTitle]="true" placeholder="Initialize tool..."
            (skillAdded)="techAdd.emit($event)">
          </app-skill-selector>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyStatsComponent {
  totalApplications = input.required<number>();
  successRate = input.required<number>();
  techStack = input.required<string[]>();

  techAdd = output<string>();
  techRemove = output<string>();
}
