import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HlmCardImports } from '@spartan-ng/helm/card';

export interface StatusSummaryItem {
  label: string;
  count: number;
  toneClass: string;
}

@Component({
  selector: 'app-schedule-widget',
  imports: [CommonModule, LucideAngularModule, ...HlmCardImports],
  templateUrl: './schedule-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleWidgetComponent {
  items = input.required<StatusSummaryItem[]>();
  total = input(0);
}
