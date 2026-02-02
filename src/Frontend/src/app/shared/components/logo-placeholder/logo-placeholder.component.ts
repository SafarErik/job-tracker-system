import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-logo-placeholder',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      class="flex items-center justify-center w-full h-full rounded-lg text-white font-bold select-none"
      [style.background]="gradient()">
      {{ initials() }}
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoPlaceholderComponent {
    companyName = input.required<string>();

    initials = computed(() => {
        const name = this.companyName();
        if (!name) return '??';

        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    });

    gradient = computed(() => {
        const name = this.companyName();
        const hash = this.getHashCode(name || '');
        const hue1 = hash % 360;
        const hue2 = (hue1 + 40) % 360;
        return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 40%))`;
    });

    private getHashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    }
}
