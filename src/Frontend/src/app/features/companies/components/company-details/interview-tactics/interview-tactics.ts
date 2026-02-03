import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideTarget, lucideLightbulb, lucideMessageSquare } from '@ng-icons/lucide';

@Component({
  selector: 'app-interview-tactics',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideSparkles, lucideTarget, lucideLightbulb, lucideMessageSquare })],
  template: `
    <div class="rounded-3xl bg-zinc-900/40 border border-zinc-800 p-5 flex flex-col relative overflow-hidden group hover:border-violet-500/30 transition-all duration-500 h-full">
      <!-- Background Glow -->
      <div class="absolute top-0 right-0 p-4 opacity-5 rotate-12 scale-150 transition-transform group-hover:scale-[1.7] duration-700">
        <ng-icon name="lucideSparkles" class="w-32 h-32 text-primary"></ng-icon>
      </div>

      <div class="relative z-10 space-y-6">
        <div class="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
          <ng-icon name="lucideSparkles" class="w-5 h-5"></ng-icon>
          Tactical Edge
        </div>

        <div class="space-y-5">
          <!-- Culture Tip -->
          <div class="flex gap-3 items-start">
            <div class="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <ng-icon name="lucideLightbulb" class="w-5 h-5 text-primary"></ng-icon>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Culture Strategy</p>
              <p class="text-sm font-medium text-zinc-100 leading-relaxed">
                Mention their recent sustainability report and how it aligns with your passion for green tech.
              </p>
            </div>
          </div>

          <!-- Technical Focus -->
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400">
              <ng-icon name="lucideTarget" class="w-5 h-5"></ng-icon>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Technical Objective</p>
              <p class="text-sm font-medium text-zinc-100 leading-relaxed">
                Double down on your Kubernetes autoscaling experience; they're currently optimizing infrastructure.
              </p>
            </div>
          </div>

          <!-- Killer Question -->
          <div class="flex gap-4">
            <div class="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-primary transition-colors">
              <ng-icon name="lucideMessageSquare" class="w-5 h-5"></ng-icon>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">S-Tier Query</p>
              <p class="text-sm font-serif italic text-zinc-300 leading-relaxed">
                "How does the team balance rapid delivery with the technical debt inherently created by scaling?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewTacticsComponent { }
