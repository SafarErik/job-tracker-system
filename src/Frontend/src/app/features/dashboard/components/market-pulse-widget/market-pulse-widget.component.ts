import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { CareerOpportunity } from '../../../../core/services/intelligence.service';

@Component({
  selector: 'app-market-pulse-widget',
  imports: [CommonModule, LucideAngularModule, ...HlmCardImports],
  templateUrl: './market-pulse-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketPulseWidgetComponent {
  isLoading = input(false);
  opportunities = input.required<CareerOpportunity[]>();
}
