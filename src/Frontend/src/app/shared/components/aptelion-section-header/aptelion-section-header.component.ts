import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-aptelion-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="aptelion-section-header">
      <div class="min-w-0">
        @if (eyebrow()) {
          <p class="aptelion-section-header__eyebrow">{{ eyebrow() }}</p>
        }

        @if (level() === 'page') {
          <h1 class="aptelion-section-header__title aptelion-section-header__title--page">
            {{ title() }}
          </h1>
        } @else {
          <h2 class="aptelion-section-header__title">
            {{ title() }}
          </h2>
        }

        @if (description()) {
          <p class="aptelion-section-header__description">{{ description() }}</p>
        }
      </div>

      <ng-content select="[section-actions]"></ng-content>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }

    .aptelion-section-header {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .aptelion-section-header__eyebrow {
      color: hsl(var(--primary));
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      margin: 0;
      text-transform: uppercase;
    }

    .aptelion-section-header__title {
      color: hsl(var(--foreground));
      font-family: var(--font-heading);
      font-size: 1.125rem;
      font-weight: 650;
      letter-spacing: 0;
      line-height: 1.35;
      margin: 0.45rem 0 0;
    }

    .aptelion-section-header__title--page {
      font-size: 1.5rem;
      line-height: 1.2;
    }

    .aptelion-section-header__description {
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
      line-height: 1.65;
      margin: 0.5rem 0 0;
      max-width: 44rem;
    }

    @media (min-width: 640px) {
      .aptelion-section-header {
        align-items: flex-start;
        flex-direction: row;
        justify-content: space-between;
      }

      .aptelion-section-header__title--page {
        font-size: 1.875rem;
      }
    }
  `,
})
export class AptelionSectionHeaderComponent {
  readonly eyebrow = input('');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly level = input<'section' | 'page'>('section');
}
