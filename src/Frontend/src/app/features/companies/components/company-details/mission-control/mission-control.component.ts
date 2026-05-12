import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideBriefcase } from '@ng-icons/lucide';
import { JobApplicationHistory } from '../../../models/company.model';

@Component({
  selector: 'app-mission-control',
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucideArrowLeft, lucideBriefcase })],
  templateUrl: './mission-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionControlComponent {
  applications = input.required<JobApplicationHistory[]>();
  viewApplication = output<string>();
}
