import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type HorizonWidgetVariant = 'default' | 'highlight' | 'compact';

@Component({
  selector: 'horizon-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="widgetClasses()">
      <div class="horizon-widget__header" *ngIf="title || subtitle">
        <div class="horizon-widget__title-section">
          <h3 *ngIf="title" class="horizon-widget__title">{{ title }}</h3>
          <p *ngIf="subtitle" class="horizon-widget__subtitle">{{ subtitle }}</p>
        </div>
        <ng-content select="[widget-actions]"></ng-content>
      </div>
      <div class="horizon-widget__content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .horizon-widget {
        border-radius: 0.5rem;
        border: 1px solid hsl(var(--border));
        background-color: hsl(var(--card));
        color: hsl(var(--card-foreground));
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .horizon-widget--default {
        padding: 1rem;
      }

      .horizon-widget--highlight {
        border-color: hsl(var(--primary) / 0.3);
        background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.03) 100%);
      }

      .horizon-widget--compact {
        padding: 0.75rem;
      }

      .horizon-widget__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }

      .horizon-widget__title {
        font-size: 0.875rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin: 0;
      }

      .horizon-widget__subtitle {
        font-size: 0.75rem;
        color: hsl(var(--muted-foreground));
        margin: 0.25rem 0 0 0;
      }

      .horizon-widget__content {
        color: hsl(var(--card-foreground));
      }
    `,
  ],
})
export class HorizonWidgetComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() variant: HorizonWidgetVariant = 'default';

  widgetClasses = computed(() => {
    return `horizon-widget horizon-widget--${this.variant}`;
  });
}
