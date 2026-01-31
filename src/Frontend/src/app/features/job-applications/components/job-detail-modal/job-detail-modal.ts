import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobType } from '../../models/job-type.enum';
import { WorkplaceType } from '../../models/workplace-type.enum';
import { JobPriority } from '../../models/job-priority.enum';

// Spartan UI
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';

@Component({
  selector: 'app-job-detail-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, ...HlmButtonImports, ...HlmCardImports, ...HlmBadgeImports],
  templateUrl: './job-detail-modal.html',
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
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const parsedId = Number.parseInt(id, 10);
      if (!isNaN(parsedId)) {
        this.loadApplication(parsedId);
      } else {
        this.error.set('Invalid application ID');
        this.isLoading.set(false);
      }
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
    const base = 'px-2.5 py-0.5 rounded-full text-xs font-semibold border border-transparent transition-all';

    switch (status) {
      case JobApplicationStatus.Applied:
        return `${base} bg-info/10 text-info`;
      case JobApplicationStatus.PhoneScreen:
        return `${base} bg-info/10 text-info`;
      case JobApplicationStatus.TechnicalTask:
        return `${base} bg-warning/10 text-warning`;
      case JobApplicationStatus.Interviewing:
        return `${base} bg-primary/10 text-primary`;
      case JobApplicationStatus.Offer:
        return `${base} bg-success/10 text-success border-success/20`;
      case JobApplicationStatus.Accepted:
        return `${base} bg-success/10 text-success`;
      case JobApplicationStatus.Rejected:
        return `${base} bg-destructive/10 text-destructive`;
      case JobApplicationStatus.Ghosted:
        return `${base} bg-muted-foreground/10 text-muted-foreground`;
      default:
        return `${base} bg-muted text-muted-foreground`;
    }
  }

  /**
   * Get human-readable status label
   */
  getStatusLabel(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied: return 'Applied';
      case JobApplicationStatus.PhoneScreen: return 'Phone Screen';
      case JobApplicationStatus.TechnicalTask: return 'Technical Task';
      case JobApplicationStatus.Interviewing: return 'Interviewing';
      case JobApplicationStatus.Offer: return 'Offer Received';
      case JobApplicationStatus.Accepted: return 'Accepted';
      case JobApplicationStatus.Rejected: return 'Rejected';
      case JobApplicationStatus.Ghosted: return 'Ghosted';
      default: return 'Unknown';
    }
  }

  /**
   * Get human-readable job type label
   */
  getJobTypeLabel(type: JobType): string {
    switch (type) {
      case JobType.FullTime: return 'Full-time';
      case JobType.PartTime: return 'Part-time';
      case JobType.Internship: return 'Internship';
      case JobType.Contract: return 'Contract';
      case JobType.Freelance: return 'Freelance';
      default: return 'Unknown';
    }
  }

  /**
   * Get human-readable workplace label
   */
  getWorkplaceLabel(type: WorkplaceType): string {
    switch (type) {
      case WorkplaceType.OnSite: return 'On-site';
      case WorkplaceType.Remote: return 'Remote';
      case WorkplaceType.Hybrid: return 'Hybrid';
      default: return 'Unknown';
    }
  }

  /**
   * Get human-readable priority label
   */
  getPriorityLabel(priority: JobPriority): string {
    switch (priority) {
      case JobPriority.High: return 'High Priority';
      case JobPriority.Medium: return 'Medium Priority';
      case JobPriority.Low: return 'Low Priority';
      default: return 'Medium';
    }
  }

  /**
   * Get CSS class for priority badge
   */
  getPriorityClass(priority: JobPriority): string {
    const base = 'px-2.5 py-0.5 rounded-full text-xs font-semibold border border-transparent transition-all';
    switch (priority) {
      case JobPriority.High:
        return `${base} bg-destructive/10 text-destructive border-destructive/20`;
      case JobPriority.Medium:
        return `${base} bg-warning/10 text-warning border-warning/20`;
      case JobPriority.Low:
        return `${base} bg-info/10 text-info border-info/20`;
      default:
        return `${base} bg-muted text-muted-foreground`;
    }
  }

  /**
   * Get CSS class for match score
   */
  getMatchScoreClass(score: number): string {
    const base = 'px-2.5 py-0.5 rounded-full text-xs font-semibold border border-transparent transition-all';
    if (score >= 80) return `${base} bg-success/10 text-success border-success/20`;
    if (score >= 50) return `${base} bg-info/10 text-info border-info/20`;
    return `${base} bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20`;
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
      this.router.navigate(['/features', 'job-applications', 'edit', app.id]);
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

  /**
   * Close modal on Escape key press
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
