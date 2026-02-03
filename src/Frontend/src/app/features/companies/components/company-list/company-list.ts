import { Component, OnInit, signal, ViewChild, ElementRef, HostListener, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { Company, ApplicationPreview } from '../../models/company.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { toast } from 'ngx-sonner';
import { CompanyCardComponent } from '../company-card/company-card';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { HlmInputImports } from '../../../../../../libs/ui/input';
import { HlmLabelImports } from '../../../../../../libs/ui/label';
import { LucideAngularModule } from 'lucide-angular';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { lucideBuilding2, lucidePlus, lucideSearch, lucideLoader2, lucideAlertTriangle, lucideActivity, lucideTrendingUp } from '@ng-icons/lucide';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    CommonModule,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...HlmLabelImports,
    CompanyCardComponent,
    NgIcon,
    ErrorStateComponent
  ],
  providers: [
    provideIcons({ lucideBuilding2, lucidePlus, lucideSearch, lucideLoader2, lucideAlertTriangle, lucideActivity, lucideTrendingUp })
  ],
  templateUrl: './company-list.html',
})
export class CompanyListComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Read signals from service
  // No need for local 'companies' signal, we use the service's one
  isLoading = this.companyService.isLoading;
  error = this.companyService.error;
  companies = this.companyService.companies;

  // Local state
  searchTerm = signal('');
  logoFailedIds = signal<Set<string>>(new Set());

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // Computed: Filtered companies
  filteredCompanies = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allCompanies = this.companyService.companies();

    if (!term) return allCompanies;

    return allCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(term) ||
        company.website?.toLowerCase().includes(term) ||
        company.address?.toLowerCase().includes(term) ||
        company.industry?.toLowerCase().includes(term),
    );
  });

  // Computed: Metrics for the Command Deck
  totalNetwork = computed(() => this.companies().length);
  activePursuits = computed(() =>
    this.companies().filter(c => c.totalApplications > 0).length
  );
  responseRate = computed(() => {
    const totalWithApps = this.companies().filter(c => c.totalApplications > 0);
    if (totalWithApps.length === 0) return '0%';

    // Simple heuristic: if furthest status is past 'Applied', it's a response
    const statusWeights: Record<string, number> = {
      'Applied': 1,
      'Rejected': 1,
      'Ghosted': 1
    };

    const responses = totalWithApps.filter(c => {
      const apps = c.recentApplications || [];
      return apps.some(a => {
        const s = a.status || 'Applied';
        return !statusWeights[s] || statusWeights[s] > 1;
      });
    }).length;

    return Math.round((responses / totalWithApps.length) * 100) + '%';
  });

  constructor() { }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  /**
   * Global keyboard listener for search shortcut (Cmd+K or Ctrl+K)
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
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

  ngOnInit(): void {
    // Initial load
    this.companyService.loadCompanies();
  }

  /**
   * Navigate to company details page
   */
  viewCompanyDetails(companyId: string): void {
    this.router.navigate(['/companies', companyId]);
  }

  /**
   * Update search term
   */
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  /**
   * Retry loading companies
   */
  retry(): void {
    this.companyService.loadCompanies();
  }

  /**
   * Navigate to add new company
   */
  addNewCompany(): void {
    this.router.navigate(['/companies/new']);
  }

  /**
   * Navigate to edit company
   */
  editCompany(companyId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/companies/edit', companyId]);
  }

  /**
   * Delete company
   */
  async deleteCompany(company: Company, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = await this.notificationService.confirm(
      `Are you sure you want to delete "${company.name}"? This will also delete all associated job applications. This action cannot be undone.`,
      'Delete Company',
    );

    if (!confirmed) {
      return;
    }

    this.companyService.deleteCompany(company.id).subscribe({
      next: () => {
        toast.success('Company Deleted', {
          description: `${company.name} has been deleted successfully.`,
        });
        // No need to manually reload, the service updates the signal
      },
      error: (err) => {
        toast.error('Delete Failed', {
          description: 'An error occurred while deleting the company. Please try again.',
        });
        console.error(err);
      },
    });
  }

  /**
   * Handle keyboard navigation for table rows
   */
  onRowKeyDown(event: KeyboardEvent, companyId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.viewCompanyDetails(companyId);
    }
  }

  /**
   * Get Clearbit logo URL for a company
   */
  getLogoUrl(company: Company): string | null {
    if (this.logoFailedIds().has(company.id)) return null;
    const name = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://logo.clearbit.com/${name}.com`;
  }

  /**
   * Handle logo load error
   */
  onLogoError(companyId: string): void {
    this.logoFailedIds.update((ids) => {
      const newSet = new Set(ids);
      newSet.add(companyId);
      return newSet;
    });
  }

  /**
   * Check if logo failed for company
   */
  isLogoFailed(companyId: string): boolean {
    return this.logoFailedIds().has(companyId);
  }

  /**
   * Get status icon/emoji for application status
   */
  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      Applied: '🔵',
      PhoneScreen: '📞',
      TechnicalTask: '💻',
      Interviewing: '🟡',
      Interview: '🟡',
      Offer: '🟢',
      Rejected: '🔴',
      Accepted: '✅',
      Ghosted: '👻',
    };
    return icons[status] || '⚪';
  }

  /**
   * Get visible applications (max 2) for display
   */
  getVisibleApplications(company: Company): ApplicationPreview[] {
    return company.recentApplications?.slice(0, 2) || [];
  }

  /**
   * Get remaining applications count
   */
  getRemainingCount(company: Company): number {
    const total = company.recentApplications?.length || 0;
    return Math.max(0, total - 2);
  }
}

