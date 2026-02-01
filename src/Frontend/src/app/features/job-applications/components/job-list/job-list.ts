import { Component, OnInit, ViewChild, ElementRef, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

// Services
import { JobApplicationStore } from '../../services/job-application.store';
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

export enum ViewMode {
  Grid = 'grid',
  Kanban = 'kanban',
  Calendar = 'calendar',
}

@Component({
  selector: 'app-job-list',
  standalone: true,
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobList implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Dependencies
  public readonly store = inject(JobApplicationStore);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Local State (View Logic Only)
  currentView: ViewMode = ViewMode.Grid;
  isStatusFilterOpen = false;
  isCompanyFilterOpen = false;

  // Enums for Template
  ViewMode = ViewMode;
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

  ngOnInit(): void {
    this.store.loadAll();
  }

  // Keyboard Shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isStatusFilterOpen || this.isCompanyFilterOpen) {
      this.isStatusFilterOpen = false;
      this.isCompanyFilterOpen = false;
    }
  }

  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // Getters for Select Options
  get companyOptions(): { id: string; name: string }[] {
    // Generate company options from the *full* application list in the store
    const options = this.store.applications()
      .filter((app) => app.companyId)
      .map((app) => ({
        id: app.companyId,
        name: app.companyName ?? 'Unknown Company',
      }));

    const unique = new Map<string, string>();
    options.forEach((option) => unique.set(option.id, option.name));

    return Array.from(unique.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get selectedStatusFilterLabel(): string {
    const currentStatus = this.store.filterStatus();
    return (
      this.statusFilters.find((filter) => filter.value === currentStatus)?.label ??
      'All Statuses'
    );
  }

  get selectedCompanyFilterLabel(): string {
    const currentCompanyId = this.store.filterCompanyId();
    if (currentCompanyId === 'all') return 'All Companies';
    return (
      this.companyOptions.find((option) => option.id === currentCompanyId)?.name ??
      'All Companies'
    );
  }

  get hasActiveFilters(): boolean {
    return (
      this.store.filterSearch().length > 0 ||
      this.store.filterStatus() !== 'all' ||
      this.store.filterCompanyId() !== 'all'
    );
  }

  // Actions
  onSearchChange(value: string): void {
    this.store.setSearchTerm(value);
  }

  clearFilters(): void {
    this.store.resetFilters();
  }

  toggleStatusFilter(event: Event): void {
    event.stopPropagation();
    this.isStatusFilterOpen = !this.isStatusFilterOpen;
    if (this.isStatusFilterOpen) this.isCompanyFilterOpen = false;
  }

  selectStatusFilter(value: JobApplicationStatus | 'all', event?: Event): void {
    event?.stopPropagation();
    this.store.setStatusFilter(value);
    this.isStatusFilterOpen = false;
  }

  toggleCompanyFilter(event: Event): void {
    event.stopPropagation();
    this.isCompanyFilterOpen = !this.isCompanyFilterOpen;
    if (this.isCompanyFilterOpen) this.isStatusFilterOpen = false;
  }

  selectCompanyFilter(value: string | 'all', event?: Event): void {
    event?.stopPropagation();
    this.store.setCompanyFilter(value);
    this.isCompanyFilterOpen = false;
  }

  async deleteApplication(id: string, event?: Event): Promise<void> {
    event?.stopPropagation();

    // Find the application (from store)
    const app = this.store.applications().find((a) => a.id === id);
    const positionName = app ? `"${app.position}" at ${app.companyName}` : 'this application';

    const confirmed = await this.notificationService.confirm(
      `This will permanently delete ${positionName}. This action cannot be undone.`,
      'Delete Application?',
    );

    if (!confirmed) return;

    this.store.deleteApplication(id);
  }

  switchView(mode: ViewMode): void {
    this.currentView = mode;
  }

  isViewActive(mode: ViewMode): boolean {
    return this.currentView === mode;
  }

  viewApplicationDetail(id: string): void {
    this.store.selectApplication(id);
    this.router.navigate(['/applications', id]);
  }

  // Welcome Message Logic
  getWelcomeSubtitle(): string {
    const hasApplications = this.store.applications().length > 0;

    if (!hasApplications) {
      return "Let's start tracking your job applications";
    }

    const activeCount = this.store.metrics().active;
    if (activeCount === 0) {
      return 'Ready to add more applications?';
    } else if (activeCount === 1) {
      return `You have 1 active application in progress`;
    } else {
      return `You have ${activeCount} active applications in progress`;
    }
  }

  onStatusChange(event: { applicationId: string; status: JobApplicationStatus }): void {
    this.store.updateApplication(event.applicationId, { status: event.status });
  }
}
