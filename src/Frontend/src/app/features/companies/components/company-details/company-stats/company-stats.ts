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
        class="bg-card rounded-[2rem] border border-border/40 p-6 md:p-8 shadow-sm flex flex-col justify-between h-48">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Total Engagement
        </p>
        <div class="flex items-end justify-between">
          <h3 class="text-5xl md:text-6xl font-black tracking-tighter">{{ totalApplications() }}</h3>
          <div class="pb-2">
            <span class="text-xs font-bold text-muted-foreground uppercase">Apps</span>
          </div>
        </div>
      </div>

      <!-- Stats Card 2: Success Rate -->
      <div
        class="bg-card rounded-[2rem] border border-border/40 p-6 md:p-8 shadow-sm flex flex-col justify-between h-48">
        <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Success Rate</p>
        <div class="flex items-end justify-between">
          <h3 class="text-5xl md:text-6xl font-black tracking-tighter" [class.text-success]="successRate() > 0">
            {{ successRate() }}%
          </h3>
          <div class="flex flex-col items-end pb-2">
            <ng-icon [name]="successRate() > 0 ? 'lucideTrendingUp' : 'lucideTrendingDown'"
              [class]="successRate() > 0 ? 'text-success' : 'text-muted-foreground/30'" size="24"></ng-icon>
          </div>
        </div>
      </div>

      <!-- Tech Stack Block -->
      <div class="bg-muted/30 rounded-[2rem] border border-border/40 p-6 md:p-8 relative group/stack">
        <app-skill-selector title="Environment Stack" placeholder="Add technology..."
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
