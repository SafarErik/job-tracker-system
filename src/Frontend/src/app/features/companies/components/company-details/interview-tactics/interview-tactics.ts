import { Component, ChangeDetectionStrategy, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideTarget, lucideLightbulb, lucideMessageSquare, lucideX, lucideChevronRight, lucideQuote, lucideFileText } from '@ng-icons/lucide';

@Component({
  selector: 'app-interview-tactics',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideSparkles, lucideTarget, lucideLightbulb, lucideMessageSquare, lucideX, lucideChevronRight, lucideQuote, lucideFileText })],
  template: `
    <div class="rounded-3xl bg-card/40 border border-border p-5 flex flex-col relative overflow-hidden h-full">
      <!-- Background Glow -->
      <div class="absolute top-0 right-0 p-4 opacity-5 rotate-12 scale-150 pointer-events-none">
        <ng-icon name="lucideSparkles" class="w-32 h-32 text-primary"></ng-icon>
      </div>

      <div class="relative z-10 flex flex-col h-full">
        <!-- Header -->
        <div class="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase mb-6">
          <ng-icon name="lucideSparkles" class="w-5 h-5"></ng-icon>
          Tactical Edge
        </div>

        <div class="flex flex-col gap-4 flex-1">
          @for (tactic of tactics; track tactic.id) {
            <button 
              (click)="openDrawer(tactic)"
              class="flex items-start gap-4 p-3 rounded-2xl transition-all duration-300 group hover:bg-muted/50 border border-transparent hover:border-border text-left w-full relative">
              
              <!-- Icon Box -->
              <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ' + tactic.colorClass">
                <ng-icon [name]="tactic.icon" class="w-5 h-5"></ng-icon>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{{ tactic.type }}</p>
                  <ng-icon name="lucideChevronRight" class="w-4 h-4 text-muted-foreground/40 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"></ng-icon>
                </div>
                <p [class]="'text-sm leading-snug line-clamp-2 ' + (tactic.id === 'query' ? 'font-serif italic text-foreground/80' : 'font-medium text-foreground/90')">
                  {{ tactic.title }}
                </p>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- Tactical Deep Dive Drawer -->
      @if (selectedTactic(); as tactic) {
        <div class="absolute inset-0 z-50 flex justify-end">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-background/60 backdrop-blur-xl transition-opacity duration-300" (click)="closeDrawer()"></div>
          
          <!-- Drawer Content -->
          <div class="relative w-full h-full bg-popover border-l border-border shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
             <!-- Close Button -->
             <button (click)="closeDrawer()" class="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors">
               <ng-icon name="lucideX" class="w-5 h-5"></ng-icon>
             </button>

             <!-- Header -->
             <div class="mt-8 mb-6">
               <div class="flex items-center gap-2 mb-3">
                 <div [class]="'p-2 rounded-lg ' + tactic.colorClass">
                   <ng-icon [name]="tactic.icon" class="w-5 h-5"></ng-icon>
                 </div>
                 <span class="text-xs font-black uppercase tracking-widest text-muted-foreground">{{ tactic.type }}</span>
               </div>
               <h3 class="text-xl font-bold text-foreground leading-tight">
                 {{ tactic.title }}
               </h3>
             </div>

             <!-- Deep Dive Sections -->
             <div class="space-y-6">
               <!-- The Reasoning -->
               <div class="space-y-2">
                 <h4 class="text-sm font-bold text-primary uppercase tracking-wide">The Reasoning</h4>
                 <div class="text-sm text-muted-foreground leading-relaxed bg-card/50 p-4 rounded-xl border border-border/50 min-h-[80px]">
                   <span class="text-foreground">{{ displayedReasoning() }}</span><span class="animate-pulse text-primary">|</span>
                 </div>
               </div>

               <!-- Actionable Phrases -->
               <div class="space-y-2">
                 <h4 class="text-sm font-bold text-success uppercase tracking-wide flex items-center gap-2">
                   <ng-icon name="lucideQuote" class="w-4 h-4"></ng-icon>
                   Actionable Phrases
                 </h4>
                 <div class="flex flex-col gap-2">
                   @for (phrase of tactic.phrases; track $index) {
                     <div class="p-4 rounded-xl bg-success/5 border border-success/10 hover:bg-success/10 transition-colors cursor-copy group/phrase relative">
                       <p class="text-sm text-success font-serif italic">
                         {{ phrase }}
                       </p>
                     </div>
                   }
                 </div>
               </div>

               <!-- CV Alignment -->
               <div class="space-y-2">
                  <h4 class="text-sm font-bold text-info uppercase tracking-wide flex items-center gap-2">
                    <ng-icon name="lucideFileText" class="w-4 h-4"></ng-icon>
                    CV Alignment
                  </h4>
                  <div class="p-3 rounded-lg bg-info/5 border border-info/10 flex items-center gap-3">
                    <div class="w-1.5 h-1.5 rounded-full bg-info"></div>
                    <p class="text-sm text-info font-medium">{{ tactic.cvAlignment }}</p>
                  </div>
               </div>
             </div>

          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class InterviewTacticsComponent implements OnDestroy {
  selectedTactic = signal<Tactic | null>(null);
  displayedReasoning = signal('');
  private typeInterval: number | undefined;

  tactics: Tactic[] = [
    {
      id: 'culture',
      type: 'Culture Strategy',
      icon: 'lucideLightbulb',
      title: 'Mention their recent sustainability report and how it aligns with your passion for green tech.',
      reasoning: 'Companies with recent green initiatives are currently prioritizing long-term thinkers over short-term fixers. This signals you are looking for a career, not a gig.',
      phrases: [
        '"I was really impressed by the Q3 sustainability goals..."',
        '"How do you see the engineering team contributing to the net-zero target?"',
        '"My values align heavily with the mission statement on page 4..."'
      ],
      cvAlignment: 'Volunteer work at GreenTech NGO (2021)',
      colorClass: 'bg-muted border-border'
    },
    {
      id: 'tech',
      type: 'Technical Objective',
      icon: 'lucideTarget',
      title: 'Double down on your Kubernetes autoscaling experience; they\'re currently optimizing infrastructure.',
      reasoning: 'Their engineering blog mentions 3 outages in the last month due to scaling issues. They are desperate for stability.',
      phrases: [
        '"In my last role, I reduced 502 errors by 40% using HPA..."',
        '"I noticed you use AWS EKS, have you considered spot instances for cost?"',
        '"I love debugging race conditions in distributed systems."'
      ],
      cvAlignment: 'Implemented K8s HPA at StartupX',
      colorClass: 'bg-violet-500/10 border-violet-500/20 text-violet-400'
    },
    {
      id: 'query',
      type: 'S-Tier Query',
      icon: 'lucideMessageSquare',
      title: '"How does the team balance rapid delivery with the technical debt inherently created by scaling?"',
      reasoning: 'This question shows you understand the trade-offs of their current growth phase. It frames you as a pragmatic senior engineer.',
      phrases: [
        '"How do you decide when to refactor vs ship?"',
        '"What is the process for paying down tech debt here?"',
        '"Do you have dedicated cooldown sprints?"'
      ],
      cvAlignment: 'Refactored Legacy Auth System (2023)',
      colorClass: 'bg-muted border-border'
    }
  ];

  openDrawer(tactic: Tactic) {
    this.selectedTactic.set(tactic);
    this.startTypewriter(tactic.reasoning);
  }

  closeDrawer() {
    this.selectedTactic.set(null);
    clearInterval(this.typeInterval);
    this.displayedReasoning.set('');
  }

  private startTypewriter(text: string) {
    this.displayedReasoning.set('');
    let i = 0;
    clearInterval(this.typeInterval);

    this.typeInterval = setInterval(() => {
      if (i < text.length) {
        this.displayedReasoning.update(current => current + text.charAt(i));
        i++;
      } else {
        clearInterval(this.typeInterval);
      }
    }, 25);
  }

  ngOnDestroy(): void {
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
    }
  }
}

interface Tactic {
  id: string;
  type: string;
  icon: string;
  title: string;
  reasoning: string;
  phrases: string[];
  cvAlignment: string;
  colorClass: string;
}
