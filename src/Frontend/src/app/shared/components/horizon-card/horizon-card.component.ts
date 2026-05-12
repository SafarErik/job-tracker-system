import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type HorizonCardVariant = 'default' | 'elevated' | 'inset' | 'bordered';
export type HorizonCardSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'horizon-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="cardClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .horizon-card {
        border-radius: 0.5rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Variants */
      .horizon-card--default {
        background-color: hsl(var(--card));
        border: 1px solid hsl(var(--border));
        color: hsl(var(--card-foreground));
      }

      .horizon-card--elevated {
        background-color: hsl(var(--card));
        border: 1px solid hsl(var(--border));
        color: hsl(var(--card-foreground));
        box-shadow:
          0 1px 3px 0 rgb(0 0 0 / 0.1),
          0 1px 2px -1px rgb(0 0 0 / 0.1);
      }

      .horizon-card--inset {
        background-color: hsl(var(--surface-inset));
        border: 1px solid hsl(var(--border) / 0.3);
        color: hsl(var(--card-foreground));
      }

      .horizon-card--bordered {
        background-color: hsl(var(--card));
        border: 2px solid hsl(var(--border));
        color: hsl(var(--card-foreground));
      }

      /* Sizes */
      .horizon-card--sm {
        padding: 0.75rem;
        border-radius: 0.5rem;
      }

      .horizon-card--md {
        padding: 1rem;
      }

      .horizon-card--lg {
        padding: 1.5rem;
      }
    `,
  ],
})
export class HorizonCardComponent {
  variant = input<HorizonCardVariant>('default');
  size = input<HorizonCardSize>('md');

  cardClasses = computed(() => {
    const base = 'horizon-card';
    return `${base} horizon-card--${this.variant()} horizon-card--${this.size()}`;
  });
}
