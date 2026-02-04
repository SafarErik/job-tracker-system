import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';
import { SkillSelectorComponent } from '../../../../../shared/components/skill-selector/skill-selector';

@Component({
   selector: 'app-company-stats',
   standalone: true,
   imports: [CommonModule, NgIcon],
   providers: [provideIcons({ lucideTrendingUp, lucideTrendingDown })],
   template: `
    <div class="space-y-4 font-sans h-full flex flex-col">
      <!-- High-Level Asset Metrics: Side-by-Side in one card -->
      <div class="rounded-3xl bg-card/40 border border-border p-5 group hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
         <div class="relative z-10 grid grid-cols-2 gap-4">
            <!-- Engagement -->
            <div class="relative">
               <div class="flex items-center gap-2 mb-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  <p class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Engagement</p>
               </div>
               <div class="flex items-end gap-2">
                   <h4 class="text-4xl font-serif font-bold text-foreground leading-none tracking-tight">{{ totalApplications() }}</h4>
                   <ng-icon name="lucideTrendingUp" class="mb-1.5 text-primary h-4 w-4 opacity-50"></ng-icon>
               </div>
            </div>

            <!-- Yield -->
             <div class="relative pl-6 border-l border-border">
               <div class="flex items-center gap-2 mb-2">
                  <div class="h-1.5 w-1.5 rounded-full bg-success"></div>
                  <p class="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Yield</p>
               </div>
               <div class="flex items-end gap-2">
                   <h4 class="text-4xl font-serif font-bold text-foreground leading-none tracking-tight">{{ successRate() }}%</h4>
                   <ng-icon name="lucideTrendingUp" class="mb-1.5 text-success h-4 w-4"></ng-icon>
               </div>
            </div>
         </div>
      </div>

      <!-- Tactical Stack: Compact Flex Cloud with Gradient -->
      <div class="rounded-3xl bg-linear-to-b from-card/40 to-transparent border border-border p-5 flex flex-col flex-1 min-h-[140px]">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <ng-icon name="lucideTrendingDown" class="h-3 w-3 rotate-180 text-primary"></ng-icon>
            Operational Stack
          </h3>
           <button class="h-6 w-6 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
             <span class="text-xs font-bold leading-none mb-0.5">+</span>
           </button>
        </div>
        
        <div class="flex flex-wrap gap-2 content-start">
          @for (tech of techStack(); track tech) {
             <div class="group/chip relative pl-3 pr-2 py-2 rounded-xl bg-muted border border-border flex items-center gap-2 hover:border-primary/30 transition-all cursor-default shadow-sm">
                <!-- Tech Glow -->
                <div class="absolute inset-0 bg-foreground/5 blur-md rounded-xl opacity-0 group-hover/chip:opacity-100 transition-opacity"></div>
                
                <span class="relative z-10 text-[10px] font-bold text-foreground tracking-wide">{{ tech }}</span>
                <button (click)="techRemove.emit(tech)" class="relative z-10 opacity-0 group-hover/chip:opacity-100 hover:text-destructive transition-opacity">
                   <ng-icon name="lucideTrendingDown" class="h-3 w-3 rotate-45"></ng-icon>
                </button>
             </div>
          }
           @if (techStack().length === 0) {
              <div class="flex-1 flex flex-col items-center justify-center opacity-30 mt-4">
                  <p class="text-[10px] font-bold text-muted-foreground italic">Ready for more tech intelligence...</p>
              </div>
           }
           @if (techStack().length > 0 && techStack().length < 5) {
              <div class="w-full mt-auto pt-4 flex justify-center opacity-20">
                  <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Awaiting further inputs...</p>
              </div>
           }
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
