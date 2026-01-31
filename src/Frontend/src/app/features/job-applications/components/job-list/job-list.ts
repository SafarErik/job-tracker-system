import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

// Services
import { ApplicationService } from '../../services/application.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';

// Models
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

// Components
import { KanbanBoardComponent } from '../kanban-board/kanban-board';
import { CalendarViewComponent } from '../calendar-view/calendar-view';
import { JobCardComponent } from '../job-card/job-card';
import { DashboardMetricsComponent } from '../../../../shared/components/dashboard-metrics/dashboard-metrics';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

// Spartan UI
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideBriefcase, lucidePlus, lucideDatabaseZap, lucideSearch, lucideSlidersHorizontal, lucideLayoutGrid, lucideLayoutList, lucideCalendar } from '@ng-icons/lucide';

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
  imports: [
    CommonModule,
    RouterLink,
    KanbanBoardComponent,
    CalendarViewComponent,
    JobCardComponent,
    DashboardMetricsComponent,
    ErrorStateComponent,
    ...HlmInputImports,
    ...HlmLabelImports,
    ...HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({ lucideBriefcase, lucidePlus, lucideDatabaseZap, lucideSearch, lucideSlidersHorizontal, lucideLayoutGrid, lucideLayoutList, lucideCalendar })],
  templateUrl: './job-list.html',
})
export class JobList implements OnInit {
  // ============================================
  // Component State (Data that changes over time)
  // ============================================

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

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
    { value: JobApplicationStatus.Accepted, label: 'Accepted' },
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
    private readonly router: Router,
    private readonly authService: AuthService,
  ) { }

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

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  /**
   * Global keyboard listener for search shortcut (Cmd+K or Ctrl+K)
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault(); // Prevent browser search or other defaults
      this.focusSearch();
    }
  }

  /**
   * Close dropdowns when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Check if click is inside any specific container if needed, 
    // but for now we rely on stopPropagation in the toggle methods
    // If the click reached here (document), it means it wasn't caught by the button or dropdown
    if (this.isStatusFilterOpen || this.isCompanyFilterOpen) {
      // We can check if the click target is NOT a filter trigger
      // But standard pattern is: click on trigger -> stopProp -> toggle
      // click outside -> prop to doc -> close all
      this.isStatusFilterOpen = false;
      this.isCompanyFilterOpen = false;
    }
  }

  /**
   * Focus the search input field
   */
  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
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

  toggleStatusFilter(event: Event): void {
    event.stopPropagation();
    this.isStatusFilterOpen = !this.isStatusFilterOpen;
    if (this.isStatusFilterOpen) this.isCompanyFilterOpen = false;
  }

  selectStatusFilter(value: JobApplicationStatus | 'all', event?: Event): void {
    event?.stopPropagation(); // Prevent bubbling to document which would double-close (harmless but checking)
    this.selectedStatusFilter = value;
    this.isStatusFilterOpen = false; // "Pro" feel: close immediately
  }

  toggleCompanyFilter(event: Event): void {
    event.stopPropagation();
    this.isCompanyFilterOpen = !this.isCompanyFilterOpen;
    if (this.isCompanyFilterOpen) this.isStatusFilterOpen = false;
  }

  selectCompanyFilter(value: number | 'all', event?: Event): void {
    event?.stopPropagation();
    this.selectedCompanyFilter = value === 'all' ? 'all' : Number(value);
    this.isCompanyFilterOpen = false; // "Pro" feel: close immediately
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
    const base = 'px-2 py-0.5 rounded-full text-xs font-medium border border-transparent transition-all';
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
   * Get count of applications in any interview stage
   */
  getInterviewCount(list: JobApplication[] = this.visibleApplications): number {
    return list.filter(
      (app) =>
        app.status === JobApplicationStatus.PhoneScreen ||
        app.status === JobApplicationStatus.TechnicalTask ||
        app.status === JobApplicationStatus.Interviewing,
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

  /**
   * Navigate to job application workstation
   * @param id - Application ID
   */
  viewApplicationDetail(id: number): void {
    this.router.navigate(['/applications', id]);
  }

  /**
   * Get personalized welcome message based on time of day and user status
   */
  getWelcomeMessage(): string {
    const user = this.authService.user();
    const firstName = user?.firstName || 'there';
    const hour = new Date().getHours();
    const hasApplications = this.applications.length > 0;

    if (!hasApplications) {
      return `Welcome, ${firstName}!`;
    }

    if (hour < 12) {
      return `Good morning, ${firstName}!`;
    } else if (hour < 18) {
      return `Good afternoon, ${firstName}!`;
    } else {
      return `Good evening, ${firstName}!`;
    }
  }

  /**
   * Get subtitle for welcome message
   */
  getWelcomeSubtitle(): string {
    const hasApplications = this.applications.length > 0;

    if (!hasApplications) {
      return "Let's start tracking your job applications";
    }

    const activeCount = this.getActiveCount(this.applications);
    if (activeCount === 0) {
      return 'Ready to add more applications?';
    } else if (activeCount === 1) {
      return `You have 1 active application in progress`;
    } else {
      return `You have ${activeCount} active applications in progress`;
    }
  }
}
