import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Services
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Models
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

// Components
import { KanbanBoardComponent } from '../kanban-board/kanban-board';
import { CalendarViewComponent } from '../calendar-view/calendar-view';

/**
 * View Mode Enum
 * Defines the available view modes for displaying job applications
 */
export enum ViewMode {
  Grid = 'grid',
  Kanban = 'kanban',
  Calendar = 'calendar',
}

/**
 * JobList Component
 *
 * This component displays all job applications with multiple view modes.
 * Users can switch between Grid, Kanban, and Calendar views.
 *
 * Key Angular Concepts Used:
 * 1. OnInit lifecycle hook - runs after component initialization
 * 2. Dependency Injection - ApplicationService is injected via constructor
 * 3. Observables - async data streams from HTTP requests
 * 4. Two-way data flow - TypeScript class <-> HTML template
 * 5. Component composition - uses child components for different views
 */
@Component({
  selector: 'app-job-list',
  standalone: true, // New Angular feature: no need for NgModule
  imports: [
    CommonModule, // Provides *ngFor, *ngIf, pipes, etc.
    RouterLink, // Enables [routerLink] directive
    KanbanBoardComponent, // Kanban view
    CalendarViewComponent, // Calendar view
  ],
  templateUrl: './job-list.html',
  styleUrl: './job-list.css',
})
export class JobList implements OnInit {
  // ============================================
  // Component State (Data that changes over time)
  // ============================================

  /**
   * Array to hold all job applications from the backend
   * Initially empty, populated after API call
   */
  applications: JobApplication[] = [];

  /**
   * Loading state indicator
   * true = data is being fetched, false = data loaded or error occurred
   * Used to show/hide loading spinner
   */
  isLoading = false;

  /**
   * Error message storage
   * null = no error, string = error occurred
   */
  errorMessage: string | null = null;

  /**
   * Current view mode
   * Controls which view (Grid, Kanban, Calendar) is displayed
   */
  currentView: ViewMode = ViewMode.Grid;

  /**
   * Search & filter state
   */
  searchTerm = '';
  selectedStatusFilter: JobApplicationStatus | 'all' = 'all';
  selectedCompanyFilter: number | 'all' = 'all';
  isStatusFilterOpen = false;
  isCompanyFilterOpen = false;

  // ============================================
  // Enums for HTML Template Access
  // ============================================

  /**
   * Make the view mode enum available to the HTML template
   */
  ViewMode = ViewMode;

  /**
   * Make the status enum available to the HTML template
   * This allows us to use JobApplicationStatus.Applied in the template
   */
  Status = JobApplicationStatus;

  statusFilters = [
    { value: 'all' as const, label: 'All Statuses' },
    { value: JobApplicationStatus.Applied, label: 'Applied' },
    { value: JobApplicationStatus.PhoneScreen, label: 'Phone Screen' },
    { value: JobApplicationStatus.TechnicalTask, label: 'Technical Task' },
    { value: JobApplicationStatus.Interviewing, label: 'Interviewing' },
    { value: JobApplicationStatus.Offer, label: 'Offer Received' },
    { value: JobApplicationStatus.Rejected, label: 'Rejected' },
    { value: JobApplicationStatus.Ghosted, label: 'Ghosted' },
  ];

  // ============================================
  // Constructor - Dependency Injection
  // ============================================

  /**
   * Angular's Dependency Injection automatically provides services
   * We declare them as 'private readonly' for immutability and encapsulation
   */
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly notificationService: NotificationService,
  ) {}

  // ============================================
  // Lifecycle Hooks
  // ============================================

  /**
   * ngOnInit - Angular lifecycle hook
   * Runs ONCE after the component is created and properties are initialized
   * Perfect place for initial data loading
   *
   * Why not use constructor?
   * - Constructor should only handle dependency injection
   * - ngOnInit is called after all inputs are set and the component is ready
   */
  ngOnInit(): void {
    this.loadApplications();
  }

  get visibleApplications(): JobApplication[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.applications.filter((app) => {
      const matchesSearch = !term
        ? true
        : [app.position, app.companyName, app.description, app.jobUrl]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term));

      const matchesStatus =
        this.selectedStatusFilter === 'all' ? true : app.status === this.selectedStatusFilter;

      const matchesCompany =
        this.selectedCompanyFilter === 'all'
          ? true
          : Number(app.companyId) === this.selectedCompanyFilter;

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }

  get companyOptions(): { id: number; name: string }[] {
    const options = this.applications
      .filter((app) => app.companyId)
      .map((app) => ({
        id: Number(app.companyId),
        name: app.companyName ?? 'Unknown Company',
      }));

    const unique = new Map<number, string>();
    options.forEach((option) => unique.set(option.id, option.name));

    return Array.from(unique.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get selectedStatusFilterLabel(): string {
    return (
      this.statusFilters.find((filter) => filter.value === this.selectedStatusFilter)?.label ??
      'All Statuses'
    );
  }

  get selectedCompanyFilterLabel(): string {
    if (this.selectedCompanyFilter === 'all') return 'All Companies';
    return (
      this.companyOptions.find((option) => option.id === this.selectedCompanyFilter)?.name ??
      'All Companies'
    );
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedStatusFilter !== 'all' ||
      this.selectedCompanyFilter !== 'all'
    );
  }

  // ============================================
  // Methods (Functions that perform actions)
  // ============================================

  /**
   * Load all job applications from the backend
   *
   * Key Concepts:
   * 1. Observable - represents a stream of data that will arrive in the future
   * 2. subscribe() - tells the Observable "I'm interested in your data"
   * 3. next - callback when data arrives successfully
   * 4. error - callback when something goes wrong
   */
  loadApplications(): void {
    this.isLoading = true; // Show loading spinner
    this.errorMessage = null; // Clear any previous errors

    // Call the service method that returns an Observable
    this.applicationService.getApplications().subscribe({
      // Success callback - runs when HTTP request succeeds
      next: (data: JobApplication[]) => {
        this.applications = data; // Store the received data
        this.isLoading = false; // Hide loading spinner
      },

      // Error callback - runs when HTTP request fails
      error: (err) => {
        console.error('Failed to load applications:', err);
        this.errorMessage =
          'Unable to load your job applications. Please check your connection and try again.';
        this.notificationService.error(
          'Failed to load applications. Please try again.',
          'Connection Error',
        );
        this.isLoading = false; // Hide loading spinner even on error
      },
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatusFilter = 'all';
    this.selectedCompanyFilter = 'all';
  }

  openStatusFilter(): void {
    this.isStatusFilterOpen = true;
  }

  closeStatusFilter(): void {
    setTimeout(() => {
      this.isStatusFilterOpen = false;
    }, 150);
  }

  selectStatusFilter(value: JobApplicationStatus | 'all'): void {
    this.selectedStatusFilter = value;
    this.isStatusFilterOpen = false;
  }

  openCompanyFilter(): void {
    this.isCompanyFilterOpen = true;
  }

  toggleCompanyFilter(): void {
    this.isCompanyFilterOpen = !this.isCompanyFilterOpen;
  }

  closeCompanyFilter(): void {
    setTimeout(() => {
      this.isCompanyFilterOpen = false;
    }, 150);
  }

  selectCompanyFilter(value: number | 'all'): void {
    this.selectedCompanyFilter = value === 'all' ? 'all' : Number(value);
    this.isCompanyFilterOpen = false;
  }

  /**
   * Delete a job application
   *
   * @param id - The unique identifier of the application to delete
   * @param event - Mouse event to prevent propagation
   *
   * Best Practice: Always confirm before destructive actions!
   */
  async deleteApplication(id: number, event?: Event): Promise<void> {
    // Prevent event bubbling if called from nested elements
    event?.stopPropagation();

    // Find the application to get details for confirmation message
    const app = this.applications.find((a) => a.id === id);
    const positionName = app ? `"${app.position}" at ${app.companyName}` : 'this application';

    // Improved confirmation dialog
    const confirmed = await this.notificationService.confirm(
      `This will permanently delete ${positionName}. This action cannot be undone.`,
      'Delete Application?',
    );

    if (!confirmed) {
      return; // User cancelled, do nothing
    }

    // Capture only the removed application
    const removedApp = this.applications.find((a) => a.id === id);
    // Optimistically remove from UI immediately
    this.applications = this.applications.filter((app) => app.id !== id);

    // Call the delete endpoint
    this.applicationService.deleteApplication(id).subscribe({
      next: () => {
        // Success: Show notification
        this.notificationService.success(
          `${positionName} has been deleted successfully.`,
          'Application Deleted',
        );
      },
      error: (err) => {
        console.error('Failed to delete application:', err);
        // Revert the optimistic update on error - only reinsert if not already present
        if (removedApp && !this.applications.some((a) => a.id === id)) {
          this.applications = [...this.applications, removedApp].sort((a, b) => b.id - a.id);
        }
        this.notificationService.error(
          'Unable to delete the application. Please try again.',
          'Delete Failed',
        );
      },
    });
  }

  /**
   * Get CSS class for status badge based on application status
   *
   * @param status - The application status enum value
   * @returns CSS class string for styling the badge
   *
   * This is a helper method to make the HTML cleaner
   */
  getStatusClass(status: JobApplicationStatus): string {
    switch (status) {
      case JobApplicationStatus.Applied:
        return 'bg-blue-100 text-blue-800';
      case JobApplicationStatus.PhoneScreen:
        return 'bg-purple-100 text-purple-800';
      case JobApplicationStatus.TechnicalTask:
        return 'bg-yellow-100 text-yellow-800';
      case JobApplicationStatus.Interviewing:
        return 'bg-indigo-100 text-indigo-800';
      case JobApplicationStatus.Offer:
        return 'bg-green-100 text-green-800';
      case JobApplicationStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case JobApplicationStatus.Ghosted:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get human-readable status label
   *
   * @param status - The application status enum value
   * @returns User-friendly status text
   */
  getStatusLabel(status: JobApplicationStatus): string {
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
      case JobApplicationStatus.Rejected:
        return 'Rejected';
      case JobApplicationStatus.Ghosted:
        return 'Ghosted';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format date string to human-readable format
   */

  // ============================================
  // View Switching Methods
  // ============================================

  /**
   * Switch to a different view mode
   *
   * @param mode - The view mode to switch to
   */
  switchView(mode: ViewMode): void {
    this.currentView = mode;
  }

  /**
   * Check if a view mode is currently active
   *
   * @param mode - The view mode to check
   * @returns true if the mode is active, false otherwise
   */
  isViewActive(mode: ViewMode): boolean {
    return this.currentView === mode;
  }

  /**
   * Handle application updates from child components
   * Reloads the applications list to ensure data consistency
   */
  onApplicationUpdated(): void {
    this.loadApplications();
  }

  // ============================================
  // Statistics Calculation Methods
  // ============================================

  /**
   * Get count of applications by status
   */
  getStatusCount(
    status: JobApplicationStatus,
    list: JobApplication[] = this.visibleApplications,
  ): number {
    return list.filter((app) => app.status === status).length;
  }

  /**
   * Get count of active applications (not rejected or ghosted)
   */
  getActiveCount(list: JobApplication[] = this.visibleApplications): number {
    return list.filter(
      (app) =>
        app.status !== JobApplicationStatus.Rejected && app.status !== JobApplicationStatus.Ghosted,
    ).length;
  }

  /**
   * Get response rate percentage
   * Responses = everything except Applied and Ghosted
   */
  getResponseRate(list: JobApplication[] = this.visibleApplications): number {
    if (list.length === 0) return 0;
    const responses = list.filter(
      (app) =>
        app.status !== JobApplicationStatus.Applied && app.status !== JobApplicationStatus.Ghosted,
    ).length;
    return Math.round((responses / list.length) * 100);
  }

  /**
   * Get success rate percentage
   * Success = offers received / total applications
   */
  getSuccessRate(list: JobApplication[] = this.visibleApplications): number {
    if (list.length === 0) return 0;
    const offers = this.getStatusCount(JobApplicationStatus.Offer, list);
    return Math.round((offers / list.length) * 100);
  }

  /**
   * Format date string to human-readable format
   *
   * @param dateString - ISO date string from backend (e.g., "2026-01-15T10:30:00Z")
   * @returns Formatted date string (e.g., "Jan 15, 2026")
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
