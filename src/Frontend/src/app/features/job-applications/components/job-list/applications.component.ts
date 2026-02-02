import { Component, OnInit, ViewChild, ElementRef, HostListener, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiStateService } from '../../../../core/services';

// Services
import { JobApplicationStore } from '../../services/job-application.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/auth/auth.service';

// Models
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';

// Components
import { ApplicationKanbanComponent } from '../kanban-board/kanban-board';
import { ApplicationGridComponent } from './application-grid.component';
import { ApplicationListComponent } from './application-list.component';
import { ApplicationStatbarComponent } from '../application-statbar/application-statbar.component';
import { CalendarViewComponent } from '../calendar-view/calendar-view';
import { DashboardMetricsComponent } from '../../../../shared/components/dashboard-metrics/dashboard-metrics';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

// Spartan UI
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmButtonImports } from '@spartan-ng/helm/button';

import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideBriefcase, lucidePlus, lucideDatabaseZap, lucideSearch, lucideSlidersHorizontal, lucideLayoutGrid, lucideLayoutList, lucideCalendar, lucideKanban } from '@ng-icons/lucide';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    ApplicationGridComponent,
    ApplicationListComponent,
    ApplicationKanbanComponent,
    ApplicationStatbarComponent,
    ...HlmButtonImports,
    NgIcon,
    RouterModule,
  ],
  providers: [provideIcons({
    lucideBriefcase,
    lucidePlus,
    lucideDatabaseZap,
    lucideSearch,
    lucideSlidersHorizontal,
    lucideLayoutGrid,
    lucideLayoutList,
    lucideCalendar,
    lucideKanban
  })],
  templateUrl: './applications.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Dependencies
  public readonly store = inject(JobApplicationStore);
  public readonly uiService = inject(UiStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Local State
  viewMode = signal<'grid' | 'kanban' | 'list'>('grid');
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');

  Status = JobApplicationStatus;

  // Categories for the Segmented Control (4 Buckets)
  categories = [
    { id: 'all', label: 'All' },
    { id: 'inbox', label: 'Inbox' },
    { id: 'active', label: 'Active' },
    { id: 'offers', label: 'Offers' },
    { id: 'archive', label: 'Archive' },
  ];

  // Logic to filter applications based on category (4 Buckets)
  filteredApps = computed(() => {
    const apps = this.store.applications();
    const category = this.selectedCategory();
    const search = this.searchQuery().toLowerCase();

    // Filter by search first
    let filtered = apps.filter(app => {
      const matchesSearch = !search ||
        app.position.toLowerCase().includes(search) ||
        (app.companyName?.toLowerCase().includes(search));
      return matchesSearch;
    });

    // Apply category filter
    switch (category) {
      case 'inbox':
        filtered = filtered.filter(app => app.status === JobApplicationStatus.Applied);
        break;
      case 'active':
        filtered = filtered.filter(app => [
          JobApplicationStatus.PhoneScreen,
          JobApplicationStatus.TechnicalTask,
          JobApplicationStatus.Interviewing
        ].includes(app.status));
        break;
      case 'offers':
        filtered = filtered.filter(app => [
          JobApplicationStatus.Offer,
          JobApplicationStatus.Accepted
        ].includes(app.status));
        break;
      case 'archive':
        filtered = filtered.filter(app => [
          JobApplicationStatus.Rejected,
          JobApplicationStatus.Ghosted
        ].includes(app.status));
        break;
      case 'all':
      default:
        // Sort: Non-archived first, then archived at the bottom
        filtered = [...filtered].sort((a, b) => {
          const aArchived = [JobApplicationStatus.Rejected, JobApplicationStatus.Ghosted].includes(a.status);
          const bArchived = [JobApplicationStatus.Rejected, JobApplicationStatus.Ghosted].includes(b.status);
          if (aArchived && !bArchived) return 1;
          if (!aArchived && bArchived) return -1;
          return 0;
        });
        break;
    }

    return filtered;
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

  switchView(mode: 'grid' | 'kanban' | 'list'): void {
    this.viewMode.set(mode);
  }

  get hasActiveFilters(): boolean {
    return (
      this.store.filterSearch().length > 0 ||
      this.store.filterStatus() !== 'all' ||
      this.store.filterCompanyId() !== 'all'
    );
  }

  isViewActive(mode: 'grid' | 'kanban' | 'list'): boolean {
    return this.viewMode() === mode;
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

  onArchive(id: string): void {
    const app = this.store.applications().find(a => a.id === id);
    if (!app) return;

    const originalStatus = app.status;
    this.store.updateApplication(id, { status: JobApplicationStatus.Rejected });

    this.notificationService.success(`Application for ${app.companyName} archived`, 'Success', {
      description: 'Moved to Rejected status',
      action: {
        label: 'Undo',
        onClick: () => this.store.updateApplication(id, { status: originalStatus })
      }
    });
  }
}
