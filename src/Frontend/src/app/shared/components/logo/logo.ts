import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-logo',
    imports: [CommonModule],
    template: `
    <div class="flex items-center gap-2.5 select-none" [class.flex-col]="vertical()">
      
      <!-- ICON CONTAINER -->
      <div class="relative flex items-center justify-center" [class]="sizeClasses()">
        
        <!-- Optional Glow -->
        <div class="absolute inset-0 bg-primary/30 rounded-full blur-xl transition-opacity duration-500"
             [class.opacity-0]="!withGlow()"
             [class.opacity-100]="withGlow()"></div>

        <!-- THE REFINED PIN SVG -->
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 w-full h-full drop-shadow-sm">
          <!-- 1. The Pin Body (Teardrop) -->
          <path d="M20 40C20 40 34 26.5 34 17C34 9.268 27.732 3 20 3C12.268 3 6 9.268 6 17C6 26.5 20 40 20 40Z" 
                class="fill-primary" />

          <!-- 2. The Briefcase (Negative Space Cutout) -->
          <rect x="13" y="15" width="14" height="10" rx="2" class="fill-white" />
          
          <!-- 3. The Handle (The Gold Accent) -->
          <path d="M16 15V13C16 11.8954 16.8954 11 18 11H22C23.1046 11 24 11.8954 24 13V15" 
                stroke="#FFE66D" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>

      <!-- TEXT -->
      @if (!iconOnly()) {
        <div class="flex flex-col justify-center" [class.items-center]="vertical()">
          <span class="font-bold tracking-tight leading-none text-foreground flex items-center gap-0.5" 
                [class]="textSizeClasses()">
            JobTracker
            <!-- The Dot matches the handle color -->
            <span class="text-[#FFE66D]">.</span>
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
    size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
    iconOnly = input<boolean>(false);
    vertical = input<boolean>(false);
    withGlow = input<boolean>(false);
    showSlogan = input<boolean>(false);

    sizeClasses = computed(() => {
        switch (this.size()) {
            case 'sm': return 'h-8 w-8';
            case 'md': return 'h-10 w-10';
            case 'lg': return 'h-16 w-16';
            case 'xl': return 'h-24 w-24';
            default: return 'h-10 w-10';
        }
    });

    textSizeClasses = computed(() => {
        switch (this.size()) {
            case 'sm': return 'text-xl';
            case 'md': return 'text-2xl';
            case 'lg': return 'text-4xl';
            case 'xl': return 'text-5xl';
            default: return 'text-2xl';
        }
    });
}
