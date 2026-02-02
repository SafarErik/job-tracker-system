import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

// Models
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

// Components
import { ApplicationKanbanCardComponent } from './application-kanban-card.component';

/**
 * Bucket Column Configuration (5 Columns)
 * Each column can contain multiple statuses
 */
interface BucketColumn {
  id: string;
  title: string;
  statuses: JobApplicationStatus[];
  borderColor: string;
  textColor: string;
  applications: JobApplication[];
  /** Optional limit for items (used for Archive column) */
  limit?: number;
}

@Component({
  selector: 'app-application-kanban',
  standalone: true,
  imports: [CommonModule, DragDropModule, ApplicationKanbanCardComponent],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationKanbanComponent {
  // Inputs
  apps = input.required<JobApplication[]>();

  // Outputs
  statusChange = output<{ applicationId: string; status: JobApplicationStatus }>();

  // Expose status enum
  readonly Status = JobApplicationStatus;

  constructor(private readonly router: Router) { }

  // Computed Columns (5 Buckets)
  columns = computed(() => {
    const apps = this.apps();

    // Define 5 bucket columns
    const cols: BucketColumn[] = [
      {
        id: 'inbox',
        title: 'Inbox',
        statuses: [JobApplicationStatus.Applied],
        borderColor: 'border-slate-500',
        textColor: 'text-slate-500',
        applications: [],
      },
      {
        id: 'screening',
        title: 'Screening',
        statuses: [JobApplicationStatus.PhoneScreen],
        borderColor: 'border-sky-500',
        textColor: 'text-sky-500',
        applications: [],
      },
      {
        id: 'active',
        title: 'Active',
        statuses: [JobApplicationStatus.TechnicalTask, JobApplicationStatus.Interviewing],
        borderColor: 'border-violet-500',
        textColor: 'text-violet-500',
        applications: [],
      },
      {
        id: 'offers',
        title: 'Offers',
        statuses: [JobApplicationStatus.Offer, JobApplicationStatus.Accepted],
        borderColor: 'border-emerald-500',
        textColor: 'text-emerald-500',
        applications: [],
      },
      {
        id: 'archive',
        title: 'Archive',
        statuses: [JobApplicationStatus.Rejected, JobApplicationStatus.Ghosted],
        borderColor: 'border-slate-400',
        textColor: 'text-slate-400',
        applications: [],
        limit: 20, // Performance limit
      },
    ];

    // Distribute applications to buckets
    apps.forEach(app => {
      const col = cols.find(c => c.statuses.includes(app.status));
      if (col) {
        // Respect limit if set
        if (!col.limit || col.applications.length < col.limit) {
          col.applications.push(app);
        }
      }
    });

    return cols;
  });

  /**
   * Handle drag & drop events
   */
  onCardDropped(event: CdkDragDrop<JobApplication[]>): void {
    if (event.previousContainer === event.container) {
      // Reorder within column (visual only, not persisted yet)
      return;
    }

    // Status change
    const movedApp = event.previousContainer.data[event.previousIndex];
    const targetColId = event.container.id;
    const targetStatus = this.getStatusFromColumnId(targetColId);

    if (targetStatus !== undefined && movedApp.status !== targetStatus) {
      this.statusChange.emit({ applicationId: movedApp.id, status: targetStatus });
    }
  }

  /**
   * Get the default status for a bucket column ID
   * Rules:
   * - Active -> Interviewing
   * - Archive -> Rejected
   * - Screening -> PhoneScreen
   * - Inbox -> Applied
   * - Offers -> Offer
   */
  private getStatusFromColumnId(id: string): JobApplicationStatus | undefined {
    switch (id) {
      case 'active': return JobApplicationStatus.Interviewing;
      case 'archive': return JobApplicationStatus.Rejected;
      case 'screening': return JobApplicationStatus.PhoneScreen;
      case 'inbox': return JobApplicationStatus.Applied;
      case 'offers': return JobApplicationStatus.Offer;
      default: return undefined;
    }
  }

  /**
   * Helpers
   */

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  navigateToCompany(event: Event, companyId: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/company', companyId]);
  }

  getConnectedLists(): string[] {
    return this.columns().map(c => c.id);
  }

  onOpenWorkstation(applicationId: string): void {
    this.router.navigate(['/workstation', applicationId]);
  }

  onOpenJobUrl(url: string): void {
    window.open(url, '_blank');
  }
}
