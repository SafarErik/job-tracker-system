import { Component, OnInit, ViewChild, ElementRef, HostListener, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
import { JobCardComponent } from '../job-card/application-card.component';
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
  List = 'list',
  Kanban = 'kanban',
  Calendar = 'calendar',
}

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JobCardComponent,
    ...HlmButtonImports,
    NgIcon,
  ],
  providers: [provideIcons({
    lucideBriefcase,
    lucidePlus,
    lucideDatabaseZap,
    lucideSearch,
    lucideSlidersHorizontal,
    lucideLayoutGrid,
    lucideLayoutList,
    lucideCalendar
  })],
  templateUrl: './applications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Dependencies
  public readonly store = inject(JobApplicationStore);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Local State
  currentView = signal<ViewMode>(ViewMode.Grid);
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  // Enums for Template
  ViewMode = ViewMode;
  Status = JobApplicationStatus;

  // Categories for the Segmented Control
  categories = [
    { id: 'all', label: 'All Apps' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'interviews', label: 'Interviews' },
    { id: 'offers', label: 'Offers' },
    { id: 'archived', label: 'Archived' },
  ];

  // Logic to filter applications based on category
  filteredByGroup = computed(() => {
    const apps = this.store.applications();
    const category = this.selectedCategory();
    const search = this.searchQuery().toLowerCase();

    return apps.filter(app => {
      // Search filter
      const matchesSearch = !search ||
        app.position.toLowerCase().includes(search) ||
        (app.companyName?.toLowerCase().includes(search));

      if (!matchesSearch) return false;

      // Category filter
      if (category === 'all') return true;
      if (category === 'in-progress') return app.status === JobApplicationStatus.Applied;
      if (category === 'interviews') return [
        JobApplicationStatus.PhoneScreen,
        JobApplicationStatus.TechnicalTask,
        JobApplicationStatus.Interviewing
      ].includes(app.status);
      if (category === 'offers') return [
        JobApplicationStatus.Offer,
        JobApplicationStatus.Accepted
      ].includes(app.status);
      if (category === 'archived') return [
        JobApplicationStatus.Rejected,
        JobApplicationStatus.Ghosted
      ].includes(app.status);

      return true;
    });
  });

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
    // Dropdowns are handled by the new toolbar
  }

  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  // Actions
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.store.setSearchTerm(value); // Keep store in sync if needed
  }

  setCategory(id: string): void {
    this.selectedCategory.set(id);
  }

  switchView(mode: ViewMode): void {
    this.currentView.set(mode);
  }

  get hasActiveFilters(): boolean {
    return (
      this.store.filterSearch().length > 0 ||
      this.store.filterStatus() !== 'all' ||
      this.store.filterCompanyId() !== 'all'
    );
  }

  isViewActive(mode: ViewMode): boolean {
    return this.currentView() === mode;
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
