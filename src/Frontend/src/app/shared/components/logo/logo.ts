import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2.5 select-none" [class.flex-col]="vertical()">
      
      <!-- ICON CONTAINER -->
      <div class="relative flex items-center justify-center transition-all duration-300" [class]="sizeClasses()">
        
        <!-- Optional Glow (Disabled in mono mode) -->
        <div class="absolute inset-0 bg-primary/25 rounded-full blur-xl transition-opacity duration-500"
             [class.opacity-0]="!withGlow() || mono()"
             [class.opacity-100]="withGlow() && !mono()"></div>

        <!-- THE ELITE PIN SVG -->
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10 w-full h-full drop-shadow-sm">
          <defs>
            <linearGradient [id]="gradientId" x1="5" y1="0" x2="35" y2="39.2" gradientUnits="userSpaceOnUse">
              <stop [attr.stop-color]="mono() ? 'currentColor' : (isDark() ? 'white' : 'var(--primary)')" />
              <stop offset="1" [attr.stop-color]="mono() ? 'currentColor' : (isDark() ? 'white' : 'var(--primary)')" stop-opacity="0.85" />
            </linearGradient>
          </defs>

          <!-- 1. The Pin Body (Teardrop) with Optical Tip Tweak (39.2 instead of 40) -->
          <path d="M20 39.2C20 39.2 34 26 34 17C34 9.268 27.732 3 20 3C12.268 3 6 9.268 6 17C6 26 20 39.2 20 39.2Z" 
                [attr.fill]="'url(#' + gradientId + ')'" 
                [class.fill-foreground]="mono()" />

          <!-- 2. The Briefcase (Dampened Cutout - fits into theme) -->
          <rect x="13" y="15" width="14" height="10" rx="2" 
                class="fill-background transition-colors duration-300" />
          
          <!-- 3. The Handle (The Gold / Theme Accent) -->
          <path d="M16 15V13C16 11.8954 16.8954 11 18 11H22C23.1046 11 24 11.8954 24 13V15" 
                [attr.stroke]="mono() ? 'currentColor' : '#FFE66D'" 
                [attr.stroke-width]="2.5" 
                stroke-linecap="round" />
        </svg>
      </div>

      <!-- TEXT -->
      @if (!iconOnly()) {
        <div class="flex flex-col justify-center" [class.items-center]="vertical()">
          <span class="font-bold tracking-tight leading-none text-foreground flex items-center gap-0.5" 
                [class]="textSizeClasses()">
            JobTracker
            <!-- The Dot matches handle or foreground -->
            <span [ngClass]="{'text-warning': !mono(), 'text-foreground': mono()}">.</span>
          </span>
          @if (showSlogan() && !mono()) {
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
  mono = input<boolean>(false);

  private readonly _themeService = inject(ThemeService);
  readonly isDark = this._themeService.isDark;

  // Generate a unique ID for the gradient to prevent collisions when multiple logos are on page
  private readonly instanceId = Math.random().toString(36).substring(2, 7);
  readonly gradientId = `pinGradient-${this.instanceId}`;

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
