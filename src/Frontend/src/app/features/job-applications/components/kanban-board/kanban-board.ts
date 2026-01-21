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

// Services
import { ApplicationService } from '../../services/application';
import { NotificationService } from '../../../../core/services/notification';

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
  imports: [CommonModule, DragDropModule],
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
      color: 'bg-blue-50 border-blue-200',
      applications: [],
    },
    {
      id: 'phone-screen',
      title: 'Phone Screen',
      status: JobApplicationStatus.PhoneScreen,
      color: 'bg-purple-50 border-purple-200',
      applications: [],
    },
    {
      id: 'technical-task',
      title: 'Technical Task',
      status: JobApplicationStatus.TechnicalTask,
      color: 'bg-indigo-50 border-indigo-200',
      applications: [],
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      status: JobApplicationStatus.Interviewing,
      color: 'bg-yellow-50 border-yellow-200',
      applications: [],
    },
    {
      id: 'offer',
      title: 'Offer',
      status: JobApplicationStatus.Offer,
      color: 'bg-green-50 border-green-200',
      applications: [],
    },
    {
      id: 'rejected',
      title: 'Rejected',
      status: JobApplicationStatus.Rejected,
      color: 'bg-red-50 border-red-200',
      applications: [],
    },
    {
      id: 'ghosted',
      title: 'Ghosted',
      status: JobApplicationStatus.Ghosted,
      color: 'bg-orange-50 border-orange-200',
      applications: [],
    },
  ];

  /**
   * Loading state for update operations
   */
  isUpdating = false;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) {}

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
        return 'Offer';
      case JobApplicationStatus.Rejected:
        return 'Rejected';
      case JobApplicationStatus.Ghosted:
        return 'Ghosted';
      default:
        return 'Unknown';
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
}
