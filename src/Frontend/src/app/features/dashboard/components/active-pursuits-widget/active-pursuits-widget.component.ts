import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { JobApplication } from '../../../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../../../job-applications/models/application-status.enum';
import { getStatusStyles } from '../../../job-applications/models/status-styles.util';

@Component({
  selector: 'app-active-pursuits-widget',
  imports: [CommonModule, LucideAngularModule, ...HlmCardImports],
  templateUrl: './active-pursuits-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivePursuitsWidgetComponent {
  isLoading = input(false);
  applications = input.required<JobApplication[]>();

  getStatusBadgeClasses(status: JobApplicationStatus): string {
    return `border ${getStatusStyles(status)}`;
  }

  getStatusLabel(status: JobApplicationStatus): string {
    return JobApplicationStatus[status].replaceAll(/([A-Z])/g, ' $1').trim();
  }

  getAppliedAtLabel(isoDate: string): string {
    const applied = new Date(isoDate).getTime();
    const diff = Date.now() - applied;
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }
}
