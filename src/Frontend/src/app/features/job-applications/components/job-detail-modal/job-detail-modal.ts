import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './job-detail-modal.html',
  styleUrl: './job-detail-modal.css',
})
export class JobDetailModalComponent implements OnInit {
  // Signals
  application = signal<JobApplication | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  showDeleteConfirm = signal(false);

  // Status enum for template
  Status = JobApplicationStatus;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly applicationService: ApplicationService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(Number.parseInt(id, 10));
    } else {
      this.error.set('Application not found');
      this.isLoading.set(false);
    }
  }

  /**
   * Load application details from API
   */
  private loadApplication(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.applicationService.getApplicationById(id).subscribe({
      next: (app) => {
        this.application.set(app);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading application:', err);
        this.error.set('Failed to load application details');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Get CSS class for status badge
   */
  getStatusClass(status: JobApplicationStatus): string {
    const statusMap: Record<JobApplicationStatus, string> = {
      [JobApplicationStatus.Applied]: 'status-applied',
      [JobApplicationStatus.PhoneScreen]: 'status-phonescreen',
      [JobApplicationStatus.TechnicalTask]: 'status-technical',
      [JobApplicationStatus.Interviewing]: 'status-interviewing',
      [JobApplicationStatus.Offer]: 'status-offer',
      [JobApplicationStatus.Rejected]: 'status-rejected',
      [JobApplicationStatus.Ghosted]: 'status-ghosted',
    };
    return statusMap[status] || 'status-unknown';
  }

  /**
   * Get human-readable status label
   */
  getStatusLabel(status: JobApplicationStatus): string {
    const labels: Record<JobApplicationStatus, string> = {
      [JobApplicationStatus.Applied]: 'Applied',
      [JobApplicationStatus.PhoneScreen]: 'Phone Screen',
      [JobApplicationStatus.TechnicalTask]: 'Technical Task',
      [JobApplicationStatus.Interviewing]: 'Interviewing',
      [JobApplicationStatus.Offer]: 'Offer',
      [JobApplicationStatus.Rejected]: 'Rejected',
      [JobApplicationStatus.Ghosted]: 'Ghosted',
    };
    return labels[status] || String(status);
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return 'long ago';
  }

  /**
   * Format salary
   */
  formatSalary(salary: number | null | undefined): string {
    if (!salary) return 'Not specified';
    return `$${salary.toLocaleString()}`;
  }

  /**
   * Close modal and go back
   */
  closeModal(): void {
    // If from company details, go back to company
    // Otherwise go back to job applications list
    const referrer = this.route.snapshot.queryParamMap.get('from');
    if (referrer === 'company') {
      const companyId = this.route.snapshot.queryParamMap.get('companyId');
      if (companyId) {
        this.router.navigate(['/companies', companyId]);
      } else {
        this.router.navigate(['/applications']);
      }
    } else {
      this.router.navigate(['/applications']);
    }
  }

  /**
   * Edit application
   */
  editApplication(): void {
    const app = this.application();
    if (app) {
      this.router.navigate(['/edit', app.id]);
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(): Promise<void> {
    const app = this.application();
    if (!app) return;

    const confirmed = await this.notificationService.confirm(
      `This will permanently delete the application for "${app.position}". This action cannot be undone.`,
      'Delete Application?',
    );

    if (!confirmed) return;

    this.applicationService.deleteApplication(app.id).subscribe({
      next: () => {
        this.notificationService.success('Application deleted successfully', 'Deleted');
        this.closeModal();
      },
      error: (err) => {
        console.error('Error deleting application:', err);
        this.notificationService.error('Failed to delete application', 'Error');
      },
    });
  }

  /**
   * Copy application details to clipboard
   */
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.notificationService.success('Copied to clipboard', 'Success');
    });
  }
}
