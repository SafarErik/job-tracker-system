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
import { ApplicationKanbanCardComponent } from './application-kanban-card/application-kanban-card.component';

/**
 * Bucket Column Configuration (4 Columns)
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

  // Computed Columns (4 Buckets)
  columns = computed(() => {
    const apps = this.apps();

    // Define 4 bucket columns (Agglomerations)
    const cols: BucketColumn[] = [
      {
        id: 'inbox',
        title: 'Inbox',
        statuses: [JobApplicationStatus.Applied],
        borderColor: 'border-zinc-800',
        textColor: 'text-zinc-500',
        applications: [],
      },
      {
        id: 'active',
        title: 'Active',
        statuses: [JobApplicationStatus.PhoneScreen, JobApplicationStatus.TechnicalTask, JobApplicationStatus.Interviewing],
        borderColor: 'border-zinc-800',
        textColor: 'text-zinc-500',
        applications: [],
      },
      {
        id: 'offers',
        title: 'Offers',
        statuses: [JobApplicationStatus.Offer, JobApplicationStatus.Accepted],
        borderColor: 'border-zinc-800',
        textColor: 'text-zinc-500',
        applications: [],
      },
      {
        id: 'archive',
        title: 'Archive',
        statuses: [JobApplicationStatus.Rejected, JobApplicationStatus.Ghosted],
        borderColor: 'border-zinc-800',
        textColor: 'text-zinc-600',
        applications: [],
        limit: 25, // Performance limit
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

    // Custom Sort for Active Column
    const activeCol = cols.find(c => c.id === 'active');
    if (activeCol) {
      activeCol.applications.sort((a, b) => {
        // 1. Status Priority
        const priority: Partial<Record<JobApplicationStatus, number>> = {
          [JobApplicationStatus.Interviewing]: 3,
          [JobApplicationStatus.TechnicalTask]: 2,
          [JobApplicationStatus.PhoneScreen]: 1
        };

        const priorityA = priority[a.status] || 0;
        const priorityB = priority[b.status] || 0;

        if (priorityA !== priorityB) {
          return priorityB - priorityA; // Higher priority first
        }

        // 2. UpdatedAt (Newest First) - with fallback to AppliedAt
        const dateA = new Date(a.updatedAt || a.appliedAt).getTime();
        const dateB = new Date(b.updatedAt || b.appliedAt).getTime();
        return dateB - dateA;
      });
    }

    return cols;
  });

  /**
   * Handle drag & drop events
   */
  onCardDropped(event: CdkDragDrop<JobApplication[]>): void {
    if (event.previousContainer === event.container) {
      // Reorder within column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
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
      case 'inbox': return JobApplicationStatus.Applied;
      case 'active': return JobApplicationStatus.Interviewing; // Entry point to active
      case 'offers': return JobApplicationStatus.Offer;
      case 'archive': return JobApplicationStatus.Rejected;
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
    this.router.navigate(['/applications', applicationId]);
  }

  onOpenJobUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
