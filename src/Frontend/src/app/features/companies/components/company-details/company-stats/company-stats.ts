import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';
import { SkillSelectorComponent } from '../../../../../shared/components/skill-selector/skill-selector';

@Component({
   selector: 'app-company-stats',
   standalone: true,
   imports: [CommonModule, NgIcon],
   providers: [provideIcons({ lucideTrendingUp, lucideTrendingDown })],
   templateUrl: './company-stats.html',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyStatsComponent {
   totalApplications = input.required<number>();
   successRate = input.required<number>();
   techStack = input.required<string[]>();

   techAdd = output<string>();
   techRemove = output<string>();
}
