import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-logo',
    imports: [CommonModule],
    template: `
    <div class="flex items-center gap-3 select-none" [class.flex-col]="vertical()">
      
      <!-- THE ICON CONTAINER -->
      <div 
        class="relative flex items-center justify-center group"
        [class]="sizeClasses()"
      >
        <!-- 1. The Glow (Atmosphere) -->
        <div 
          class="absolute inset-0 bg-primary/30 rounded-full blur-xl transition-all duration-700 group-hover:bg-primary/50 group-hover:blur-2xl"
          [class.opacity-0]="!withGlow()"
          [class.opacity-100]="withGlow()"
        ></div>

        <!-- 2. The SVG Mark -->
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 w-full h-full drop-shadow-sm">
          
          <!-- PART A: The Stack (The Foundation) 
               Status: Dark/Stable
               Metaphor: The pile of applications you need to manage.
          -->
          <rect x="8" y="14" width="18" height="18" rx="5" 
                class="fill-foreground/20 dark:fill-white/10 transition-colors" 
                transform="rotate(-5 17 23)" />

          <!-- PART B: The Velocity (The Active Card)
               Status: Primary Brand Color
               Metaphor: Moving an application forward.
          -->
          <rect x="14" y="8" width="18" height="18" rx="5" 
                class="fill-primary transition-all duration-300 group-hover:fill-primary/80 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" 
                transform="rotate(5 23 17)" />

          <!-- PART C: The Target (The Gold Focus) 
               Status: Gold Accent
               Metaphor: The Offer / The Bullseye.
               Placement: It sits exactly at the intersection, locking the composition.
          -->
          <circle cx="28" cy="12" r="3.5" 
                  class="fill-accent stroke-background stroke-[2.5]" />
                  
          <!-- Optional: Motion Line (Subtle) -->
          <path d="M10 32L6 36" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-muted-foreground/30" />
        </svg>
      </div>

      <!-- THE TYPOGRAPHY -->
      @if (!iconOnly()) {
        <div class="flex flex-col" [class.items-center]="vertical()">
          <span 
            class="font-bold tracking-tight leading-none text-foreground flex items-center gap-0.5" 
            [class]="textSizeClasses()"
          >
            JobTracker
            <!-- Period mark matching the logo target -->
            <span class="text-accent">.</span>
          </span>
          
          @if (showSlogan()) {
            <span class="text-[0.65rem] font-bold tracking-[0.2em] text-muted-foreground uppercase mt-1.5 opacity-80">
              Career Command
            </span>
          }
        </div>
      }
    </div>
  `
})
export class LogoComponent {
    // Inputs using Angular Signals
    size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
    iconOnly = input<boolean>(false);
    vertical = input<boolean>(false);
    withGlow = input<boolean>(false);
    showSlogan = input<boolean>(false);

    // Computed classes for container size
    sizeClasses = computed(() => {
        switch (this.size()) {
            case 'sm': return 'h-8 w-8';
            case 'md': return 'h-10 w-10';
            case 'lg': return 'h-16 w-16'; // Perfect for Login
            case 'xl': return 'h-24 w-24';
            default: return 'h-10 w-10';
        }
    });

    // Computed classes for text size
    textSizeClasses = computed(() => {
        switch (this.size()) {
            case 'sm': return 'text-lg';
            case 'md': return 'text-xl';
            case 'lg': return 'text-3xl';
            case 'xl': return 'text-5xl';
            default: return 'text-xl';
        }
    });
}
