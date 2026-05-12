import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-aptelion-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="aptelion-empty-state" [class.aptelion-empty-state--compact]="compact()">
      <p class="aptelion-empty-state__title">{{ title() }}</p>
      <p class="aptelion-empty-state__body">{{ body() }}</p>
      <div class="aptelion-empty-state__action">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .aptelion-empty-state {
      align-items: center;
      background: hsl(var(--muted) / 0.2);
      border: 1px dashed hsl(var(--border));
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      padding: 2rem 1.25rem;
      text-align: center;
    }

    .aptelion-empty-state--compact {
      padding: 1.35rem 1rem;
    }

    .aptelion-empty-state__title {
      color: hsl(var(--foreground));
      font-size: 0.875rem;
      font-weight: 650;
      margin: 0;
    }

    .aptelion-empty-state__body {
      color: hsl(var(--muted-foreground));
      font-size: 0.75rem;
      line-height: 1.55;
      margin: 0.5rem auto 0;
      max-width: 24rem;
    }

    .aptelion-empty-state__action {
      margin-top: 1rem;
    }
  `,
})
export class AptelionEmptyStateComponent {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly compact = input(false);
}
