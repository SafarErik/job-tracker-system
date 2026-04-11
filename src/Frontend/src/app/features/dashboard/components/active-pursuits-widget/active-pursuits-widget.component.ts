import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LanguageService } from '../../../../core/services';
import { JobApplication } from '../../../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../../../job-applications/models/application-status.enum';
import { getStatusStyles } from '../../../job-applications/models/status-styles.util';

@Component({
  selector: 'app-active-pursuits-widget',
  imports: [CommonModule, TranslocoPipe, LucideAngularModule, ...HlmCardImports],
  templateUrl: './active-pursuits-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivePursuitsWidgetComponent {
  private readonly languageService = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);

  isLoading = input(false);
  applications = input.required<JobApplication[]>();

  getStatusBadgeClasses(status: JobApplicationStatus): string {
    return `border ${getStatusStyles(status)}`;
  }

  getStatusLabel(status: JobApplicationStatus): string {
    const rawStatus = JobApplicationStatus[status] ?? 'Applied';
    return this.t(`dashboard.workQueue.status.${rawStatus}`);
  }

  getAppliedAtLabel(isoDate: string): string {
    const applied = new Date(isoDate).getTime();
    const diff = Date.now() - applied;
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

    if (days === 0) return this.t('common.time.today');
    if (days === 1) return this.t('common.time.dayAgo');
    return this.t('common.time.daysAgo', { count: days });
  }

  private t(key: string, params?: Record<string, unknown>): string {
    this.languageService.locale();
    return this.transloco.translate(key, params);
  }
}
