import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 select-none transition-all duration-300 ease-in-out" 
         [class.flex-col]="vertical()"
         [class.justify-center]="vertical() || iconOnly()">
      
      <!-- ICON CONTAINER -->
      <div class="relative flex items-center justify-center shrink-0 transition-all duration-300" [class]="sizeClasses()">
        
        <!-- Optional Glow -->
        <div class="absolute inset-0 bg-violet-600/20 rounded-full blur-xl transition-opacity duration-500"
             [class.opacity-0]="!withGlow()"
             [class.opacity-100]="withGlow()"></div>

        <!-- Static Logo Image -->
        <!-- Scaled up to compensate for internal padding in PNG -->
        <img src="assets/logo.png" 
             [style.width.px]="imgSize()" 
             [style.height.px]="imgSize()"
             alt="Vantage Cursus Logo"
             class="relative z-10 object-contain drop-shadow-sm transition-all duration-300 scale-150"
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
          <span class="font-[900] tracking-tight leading-none text-foreground font-sans">
            VANTAGE
          </span>
          <span class="font-[300] tracking-wide leading-none text-foreground font-sans uppercase">
            CURSUS
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
      case 'sm': return 'h-10 w-10';
      case 'md': return 'h-14 w-14'; // Slightly reduced from 16 to fit header better if scaled
      case 'lg': return 'h-24 w-24';
      case 'xl': return 'h-32 w-32';
      default: return 'h-14 w-14';
    }
  });

  imgSize = computed(() => {
    switch (this.size()) {
      case 'sm': return 40;
      case 'md': return 56; // Matching new md h-14
      case 'lg': return 96;
      case 'xl': return 128;
      default: return 56;
    }
  });

  textSizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl'; // Reduced from 2xl to fit sidebar
      case 'lg': return 'text-4xl';
      case 'xl': return 'text-6xl';
      default: return 'text-xl';
    }
  });
}
