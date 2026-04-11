import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-logo',
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 select-none transition-all duration-300 ease-in-out" 
         [class.flex-col]="vertical()"
         [class.justify-center]="vertical() || iconOnly()">
      
      <!-- ICON CONTAINER -->
      <div class="relative flex items-center justify-center shrink-0 transition-all duration-300" [class]="sizeClasses()">
        
        <!-- Optional Glow -->
        <div class="absolute inset-0 rounded-lg bg-primary/20 blur-xl transition-opacity duration-500"
             [class.opacity-0]="!withGlow()"
             [class.opacity-100]="withGlow()"></div>

        <img src="assets/brand/horizon-guided-path.svg"
             [style.width.px]="imgSize()" 
             [style.height.px]="imgSize()"
             alt="Horizon"
             class="relative z-10 object-contain drop-shadow-sm transition-all duration-300"
             [class.grayscale]="mono()"
             [class.brightness-200]="mono() && isDark()"
             [class.invert]="mono() && !isDark()"
             />
      </div>

      <!-- TEXT CONTAINER -->
      <div class="flex flex-col justify-center whitespace-nowrap overflow-hidden transition-all duration-300 origin-left"
           [class.w-0]="iconOnly() && !vertical()"
           [class.opacity-0]="iconOnly() && !vertical()"
           [class.w-auto]="!iconOnly() || vertical()"
           [class.opacity-100]="!iconOnly() || vertical()"
           [class.items-center]="vertical()">
           
        <div class="flex items-baseline gap-1.5" [class]="textSizeClasses()">
          <span class="font-display font-bold leading-none text-foreground">
            HORIZON
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LogoComponent {
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  iconOnly = input<boolean>(false);
  vertical = input<boolean>(false);
  withGlow = input<boolean>(false);
  mono = input<boolean>(false);

  private readonly _themeService = inject(ThemeService);
  readonly isDark = this._themeService.isDark;

  sizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'h-9 w-9';
      case 'md': return 'h-12 w-12';
      case 'lg': return 'h-20 w-20';
      case 'xl': return 'h-28 w-28';
      default: return 'h-12 w-12';
    }
  });

  imgSize = computed(() => {
    switch (this.size()) {
      case 'sm': return 36;
      case 'md': return 48;
      case 'lg': return 80;
      case 'xl': return 112;
      default: return 48;
    }
  });

  textSizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl';
      case 'lg': return 'text-4xl';
      case 'xl': return 'text-6xl';
      default: return 'text-xl';
    }
  });
}
