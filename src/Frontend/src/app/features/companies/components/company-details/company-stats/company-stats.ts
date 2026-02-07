import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrendingUp, lucideTrendingDown } from '@ng-icons/lucide';

@Component({
   selector: 'app-company-stats',
   standalone: true,
   imports: [CommonModule, NgIcon],
   providers: [
      provideIcons({
         lucideTrendingUp,
         lucideTrendingDown
      })
   ],
   templateUrl: './company-stats.html',
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyStatsComponent {
   totalApplications = input.required<number>();
   successRate = input.required<number>();
   techStack = input.required<string[]>();
   compact = input<boolean>(false);

   techAdd = output<void>();
   techRemove = output<string>();
}
