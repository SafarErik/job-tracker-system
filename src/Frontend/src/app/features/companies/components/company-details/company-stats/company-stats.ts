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
      <!-- Stats Card 1: Engagement -->
      <div
        class="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 shadow-[0_0_20px_-10px_rgba(255,255,255,0.05)] flex flex-col justify-between h-48 group hover:border-zinc-700 transition-all">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 group-hover:text-zinc-400 transition-colors">Field Metrics // Engagement</p>
        <div class="flex items-end justify-between leading-none">
          <h3 class="text-6xl font-black tracking-tighter text-zinc-100">{{ totalApplications() }}</h3>
          <div class="pb-2">
            <span class="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Leads</span>
          </div>
        </div>
      </div>

      <!-- Stats Card 2: Success Rate -->
      <div
        class="bg-zinc-900/40 rounded-[2rem] border border-zinc-800 p-8 shadow-[0_0_30px_-10px_rgba(139,92,246,0.15)] flex flex-col justify-between h-48 group hover:border-violet-500/30 transition-all">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 group-hover:text-violet-400 transition-colors">Field Metrics // Yield</p>
        <div class="flex items-end justify-between leading-none">
          <h3 class="text-6xl font-black tracking-tighter text-zinc-100">
            {{ successRate() }}<span class="text-3xl text-zinc-600">%</span>
          </h3>
          <div class="flex flex-col items-end pb-2">
            <ng-icon [name]="successRate() > 0 ? 'lucideTrendingUp' : 'lucideTrendingDown'"
              [class]="successRate() > 0 ? 'text-violet-400' : 'text-zinc-700'" size="28"></ng-icon>
          </div>
        </div>
      </div>

      <!-- Tech Stack Block -->
      <div class="bg-zinc-900/20 rounded-[2rem] border border-zinc-900 p-8 relative group/stack hover:border-zinc-800 transition-all">
        <app-skill-selector title="Operational Stack" placeholder="Identify technology..."
          [selectedSkills]="techStack()" (skillAdded)="techAdd.emit($event)"
          (skillRemoved)="techRemove.emit($event)">
        </app-skill-selector>
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
