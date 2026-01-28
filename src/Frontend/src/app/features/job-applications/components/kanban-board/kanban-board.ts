import { Component, Input, Output, EventEmitter } from '@angular/core';
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
import { JobCardComponent } from '../job-card/job-card';

// Services
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';

/**
 * Status Column Configuration
 * Defines the visual representation and order of Kanban columns
 */
interface StatusColumn {
  id: string;
  title: string;
  status: JobApplicationStatus;
  color: string; // Tailwind color class
  applications: JobApplication[];
}

/**
 * KanbanBoard Component
 *
 * A drag-and-drop Kanban board for managing job applications.
 * Users can drag cards between columns to update application status.
 *
 * Key Features:
 * - Drag & drop using Angular CDK
 * - Real-time status updates
 * - Responsive design with Tailwind CSS
 * - Visual feedback during drag operations
 */
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, JobCardComponent],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css',
})
export class KanbanBoardComponent {
  /**
   * Input: All job applications to display on the board
   */
  @Input() set applications(apps: JobApplication[]) {
    this._applications = apps;
    this.organizeApplicationsByStatus();
  }

  /**
   * Output: Emits when an application is updated
   * Parent component can refresh data if needed
   */
  @Output() applicationUpdated = new EventEmitter<void>();

  /**
   * Internal storage for applications
   */
  private _applications: JobApplication[] = [];

  /**
   * Kanban columns configuration
   * Order matters - represents the visual flow from left to right
   */
  columns: StatusColumn[] = [
    {
      id: 'applied',
      title: 'Applied',
      status: JobApplicationStatus.Applied,
      color: 'border-blue-500/20 bg-blue-500/5',
      applications: [],
    },
    {
      id: 'phone-screen',
      title: 'Phone Screen',
      status: JobApplicationStatus.PhoneScreen,
      color: 'border-indigo-500/20 bg-indigo-500/5',
      applications: [],
    },
    {
      id: 'technical-task',
      title: 'Technical Task',
      status: JobApplicationStatus.TechnicalTask,
      color: 'border-orange-500/20 bg-orange-500/5',
      applications: [],
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      status: JobApplicationStatus.Interviewing,
      color: 'border-violet-500/20 bg-violet-500/5',
      applications: [],
    },
    {
      id: 'offer',
      title: 'Offer',
      status: JobApplicationStatus.Offer,
      color: 'border-amber-500/30 bg-amber-500/5',
      applications: [],
    },
    {
      id: 'accepted',
      title: 'Accepted',
      status: JobApplicationStatus.Accepted,
      color: 'border-emerald-500/20 bg-emerald-500/5',
      applications: [],
    },
    {
      id: 'rejected',
      title: 'Rejected',
      status: JobApplicationStatus.Rejected,
      color: 'border-rose-500/20 bg-rose-500/5',
      applications: [],
    },
    {
      id: 'ghosted',
      title: 'Ghosted',
      status: JobApplicationStatus.Ghosted,
      color: 'border-slate-500/20 bg-slate-500/5',
      applications: [],
    },
  ];

  /**
   * Loading state for update operations
   */
  isUpdating = false;

  /**
   * Expose status enum for template conditionals
   */
  readonly Status = JobApplicationStatus;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) { }

  /**
   * Organize applications into their respective status columns
   */
  private organizeApplicationsByStatus(): void {
    // Reset all columns
    this.columns.forEach((col) => (col.applications = []));

    // Distribute applications to columns based on status
    this._applications.forEach((app) => {
      const column = this.columns.find((col) => col.status === app.status);
      if (column) {
        column.applications.push(app);
      }
    });
  }

  /**
   * Handle drag & drop events
   * Called when user drops a card in a column
   *
   * @param event - CDK drag-drop event containing source and target info
   */
  onCardDropped(event: CdkDragDrop<JobApplication[]>): void {
    const previousColumn = event.previousContainer.data;
    const currentColumn = event.container.data;

    // Case 1: Card moved within the same column (reorder)
    if (event.previousContainer === event.container) {
      moveItemInArray(currentColumn, event.previousIndex, event.currentIndex);
      return;
    }

    // Case 2: Card moved to a different column (status change)
    const movedApplication = previousColumn[event.previousIndex];
    const newStatus = this.getStatusFromColumn(event.container.id);

    if (newStatus !== undefined && movedApplication) {
      // Save old status for potential rollback
      const oldStatus = movedApplication.status;

      // Optimistically update UI first
      transferArrayItem(previousColumn, currentColumn, event.previousIndex, event.currentIndex);

      // Update backend
      this.updateApplicationStatus(movedApplication, newStatus, oldStatus);
    }
  }

  /**
   * Get status enum value from column ID
   */
  private getStatusFromColumn(columnId: string): JobApplicationStatus | undefined {
    const column = this.columns.find((col) => col.id === columnId);
    return column?.status;
  }

  /**
   * Update application status in the backend
   *
   * @param application - The application to update
   * @param newStatus - The new status to apply
   */
  /**
   * Update application status in the backend
   *
   * @param application - The application to update
   * @param newStatus - The new status to apply
   * @param oldStatus - The previous status for rollback
   */
  private updateApplicationStatus(
    application: JobApplication,
    newStatus: JobApplicationStatus,
    oldStatus: JobApplicationStatus,
  ): void {
    this.isUpdating = true;
    const statusLabel = this.getStatusLabel(newStatus);

    // Optimistically update the local application object
    application.status = newStatus;

    // Create update payload with all required fields
    const updatePayload = {
      position: application.position,
      companyId: application.companyId,
      jobUrl: application.jobUrl,
      description: application.description,
      status: newStatus,
    };

    this.applicationService.updateApplication(application.id, updatePayload).subscribe({
      next: () => {
        this.isUpdating = false;

        // Show success notification
        this.notificationService.success(
          `${application.position} moved to ${statusLabel}`,
          'Status Updated',
        );

        // No need to emit update - component state is already correct
        // Parent doesn't need to reload since we've already updated locally
      },
      error: (error) => {
        console.error('Failed to update application status:', error);
        this.isUpdating = false;

        // Revert the optimistic update
        application.status = oldStatus;

        // Show error notification
        this.notificationService.error(
          'Unable to update application status. The change has been reverted.',
          'Update Failed',
        );

        // Re-organize columns to revert the UI change
        this.organizeApplicationsByStatus();

        // Still emit update to ensure parent is aware
        this.applicationUpdated.emit();
      },
    });
  }

  /**
   * Get human-readable status label
   */
  private getStatusLabel(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'Applied';
      case JobApplicationStatus.PhoneScreen:
        return 'Phone Screen';
      case JobApplicationStatus.TechnicalTask:
        return 'Technical Task';
      case JobApplicationStatus.Interviewing:
        return 'Interviewing';
      case JobApplicationStatus.Offer:
        return 'Offer Received';
      case JobApplicationStatus.Accepted:
        return 'Accepted';
      case JobApplicationStatus.Rejected:
        return 'Rejected';
      case JobApplicationStatus.Ghosted:
        return 'Ghosted';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get semantic text color for column headers
   */
  getColumnColorClass(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied: return 'text-blue-600 dark:text-blue-400';
      case JobApplicationStatus.PhoneScreen: return 'text-indigo-600 dark:text-indigo-400';
      case JobApplicationStatus.TechnicalTask: return 'text-orange-600 dark:text-orange-400';
      case JobApplicationStatus.Interviewing: return 'text-violet-600 dark:text-violet-400';
      case JobApplicationStatus.Offer: return 'text-amber-600 dark:text-amber-400';
      case JobApplicationStatus.Accepted: return 'text-emerald-600 dark:text-emerald-400';
      case JobApplicationStatus.Rejected: return 'text-rose-600 dark:text-rose-400';
      case JobApplicationStatus.Ghosted: return 'text-slate-600 dark:text-slate-400';
      default: return 'text-foreground';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Navigate to company details page
   */
  navigateToCompany(event: Event, companyId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/company', companyId]);
  }

  /**
   * Get connected drop list IDs for CDK drag-drop
   * This allows cards to be moved between any columns
   */
  getConnectedLists(): string[] {
    return this.columns.map((col) => col.id);
  }

  /**
   * Handle 'Open Workstation' event from Job Card
   */
  onOpenWorkstation(applicationId: number): void {
    // Navigate to workstation view (assuming route structure)
    // Adjust route as needed based on app routing
    this.router.navigate(['/applications', applicationId]);
  }

  /**
   * Handle 'Open Job URL' event from Job Card
   */
  onOpenJobUrl(url: string): void {
    window.open(url, '_blank');
  }
}
