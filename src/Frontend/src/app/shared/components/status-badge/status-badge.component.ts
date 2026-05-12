import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusBadgeTone =
  | 'neutral'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'muted';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()">{{ label() }}</span>`,
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusBadgeTone>('neutral');

  readonly classes = computed(() => {
    const base =
      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]';

    switch (this.tone()) {
      case 'primary':
        return `${base} border-primary/35 bg-primary/10 text-primary`;
      case 'accent':
        return `${base} border-accent/35 bg-accent/10 text-accent`;
      case 'success':
        return `${base} border-success/35 bg-success/10 text-success`;
      case 'warning':
        return `${base} border-warning/40 bg-warning/10 text-warning`;
      case 'destructive':
        return `${base} border-destructive/35 bg-destructive/10 text-destructive`;
      case 'muted':
        return `${base} border-border bg-muted/60 text-muted-foreground`;
      default:
        return `${base} border-border bg-card text-foreground`;
    }
  });
}
