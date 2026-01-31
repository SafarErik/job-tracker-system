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
import { JobCardComponent } from '../job-card/job-card';

/**
 * Status Column Configuration
 */
interface StatusColumn {
  id: string;
  title: string;
  status: JobApplicationStatus;
  color: string;
  applications: JobApplication[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, JobCardComponent],
  templateUrl: './kanban-board.html',
  styleUrl: './kanban-board.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  // Inputs
  applications = input.required<JobApplication[]>();

  // Outputs
  statusChange = output<{ applicationId: number; status: JobApplicationStatus }>();

  // Expose status enum
  readonly Status = JobApplicationStatus;

  constructor(private readonly router: Router) { }

  // Computed Columns
  columns = computed(() => {
    const apps = this.applications();

    // Define base columns structure
    const cols: StatusColumn[] = [
      { id: 'Applied', title: 'Applied', status: JobApplicationStatus.Applied, color: 'border-info/20 bg-info/5', applications: [] },
      { id: 'PhoneScreen', title: 'Phone Screen', status: JobApplicationStatus.PhoneScreen, color: 'border-info/20 bg-info/5', applications: [] },
      { id: 'TechnicalTask', title: 'Tech Task', status: JobApplicationStatus.TechnicalTask, color: 'border-warning/20 bg-warning/5', applications: [] },
      { id: 'Interviewing', title: 'Interviewing', status: JobApplicationStatus.Interviewing, color: 'border-primary/20 bg-primary/5', applications: [] },
      { id: 'Offer', title: 'Offer', status: JobApplicationStatus.Offer, color: 'border-success/30 bg-success/5', applications: [] },
      { id: 'Accepted', title: 'Accepted', status: JobApplicationStatus.Accepted, color: 'border-success/20 bg-success/5', applications: [] },
      { id: 'Rejected', title: 'Rejected', status: JobApplicationStatus.Rejected, color: 'border-destructive/20 bg-destructive/5', applications: [] },
      { id: 'Ghosted', title: 'Ghosted', status: JobApplicationStatus.Ghosted, color: 'border-muted-foreground/20 bg-muted-foreground/5', applications: [] },
    ];

    // Distribute applications
    apps.forEach(app => {
      const col = cols.find(c => c.status === app.status);
      if (col) {
        col.applications.push(app);
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
    // Find new status based on container mapped to column
    // Since we rebuild columns effectively, and CdkDragDrop connects to 'data'.
    // We can get status from the target column's 'data' (if we knew which one it was associated with easily via ID)
    // Or closer: The 'id' of the connected list is the column ID (which we set to status-like string).

    const targetColId = event.container.id;
    const targetStatus = this.getStatusFromColumnId(targetColId);

    if (targetStatus !== undefined && movedApp.status !== targetStatus) {
      this.statusChange.emit({ applicationId: movedApp.id, status: targetStatus });
    }
  }

  private getStatusFromColumnId(id: string): JobApplicationStatus | undefined {
    const col = this.columns().find(c => c.id === id);
    return col?.status;
  }

  /**
   * Helpers
   */
  getColumnColorClass(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied: return 'text-info';
      case JobApplicationStatus.PhoneScreen: return 'text-info/80';
      case JobApplicationStatus.TechnicalTask: return 'text-warning/80';
      case JobApplicationStatus.Interviewing: return 'text-primary';
      case JobApplicationStatus.Offer: return 'text-success';
      case JobApplicationStatus.Accepted: return 'text-success/80';
      case JobApplicationStatus.Rejected: return 'text-destructive';
      case JobApplicationStatus.Ghosted: return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  navigateToCompany(event: Event, companyId: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/company', companyId]);
  }

  getConnectedLists(): string[] {
    return this.columns().map(c => c.id);
  }

  onOpenWorkstation(applicationId: number): void {
    this.router.navigate(['/applications', applicationId]);
  }

  onOpenJobUrl(url: string): void {
    window.open(url, '_blank');
  }
}
