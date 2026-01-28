import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CompanyDetail, CompanyNews } from '../../models/company.model';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { HlmCardImports } from '../../../../../../libs/ui/card';
import { HlmBadgeImports } from '../../../../../../libs/ui/badge';
import { HlmInputImports } from '../../../../../../libs/ui/input';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [
    CommonModule,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmInputImports,
  ],
  templateUrl: './company-details.html',
})
export class CompanyDetailsComponent implements OnInit {
  // Core signals
  companyDetails = signal<CompanyDetail | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Intelligence signals
  companyNews = signal<CompanyNews[]>([]);
  newsLoading = signal(false);
  companyNotes = signal('');
  logoFailed = signal(false);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly companyService: CompanyService,
    private readonly intelligenceService: CompanyIntelligenceService,
    private readonly notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadCompanyDetails(Number.parseInt(id, 10));
    } else {
      this.error.set('Invalid company ID');
      this.isLoading.set(false);
    }
  }

  /**
   * Load company details from the API
   */
  private loadCompanyDetails(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.companyService.getCompanyDetails(id).subscribe({
      next: (details) => {
        this.companyDetails.set(details);
        this.companyNotes.set(details.notes || '');
        this.isLoading.set(false);
        // Load mock news after company details
        this.loadCompanyNews(details.name);
      },
      error: (err) => {
        console.error('Error loading company details:', err);
        this.error.set('Failed to load company details. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Load mock company news
   */
  private loadCompanyNews(companyName: string): void {
    this.newsLoading.set(true);
    this.intelligenceService.getCompanyNews(companyName, 3).subscribe({
      next: (news) => {
        this.companyNews.set(news);
        this.newsLoading.set(false);
      },
      error: () => {
        this.newsLoading.set(false);
      },
    });
  }

  /**
   * Get Clearbit logo URL
   */
  getLogoUrl(): string | null {
    if (this.logoFailed()) return null;
    const details = this.companyDetails();
    if (!details) return null;

    let domain = '';
    if (details.website) {
      try {
        let website = details.website;
        if (!/^https?:\/\//i.test(website)) {
          website = `http://${website}`;
        }
        const url = new URL(website);
        domain = url.hostname.replace(/^www\./, '');
      } catch {
        // Fallback for malformed URLs
      }
    }

    if (!domain && details.name) {
      const cleanName = details.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName) domain = `${cleanName}.com`;
    }

    return domain ? `https://logo.clearbit.com/${domain}` : null;
  }

  /**
   * Handle logo error
   */
  onLogoError(): void {
    this.logoFailed.set(true);
  }

  /**
   * Calculate success rate (Offers / Total Applications)
   */
  getSuccessRate(): number {
    const details = this.companyDetails();
    if (!details || details.totalApplications === 0) return 0;
    const offers = details.applicationHistory.filter(
      (app) => app.status === 'Offer' || app.status === 'Accepted',
    ).length;
    return Math.round((offers / details.totalApplications) * 100);
  }

  /**
   * Navigate to job application details
   */
  viewApplication(applicationId: number): void {
    const companyId = this.companyDetails()?.id;
    this.router.navigate(['/view', applicationId], {
      queryParams: {
        from: 'company',
        companyId: companyId,
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/companies']);
  }

  editCompany(): void {
    const details = this.companyDetails();
    if (details) {
      this.router.navigate(['/companies/edit', details.id]);
    }
  }

  async deleteCompany(): Promise<void> {
    const details = this.companyDetails();
    if (!details) return;

    const confirmed = await this.notificationService.confirm(
      `This will permanently delete "${details.name}". This action cannot be undone.`,
      'Delete Company?',
    );

    if (!confirmed) return;

    this.companyService.deleteCompany(details.id).subscribe({
      next: () => {
        this.notificationService.success(
          `${details.name} has been deleted successfully.`,
          'Company Deleted',
        );
        this.router.navigate(['/companies']);
      },
      error: (err) => {
        console.error('Failed to delete company:', err);
        this.notificationService.error(
          'Unable to delete the company. Please try again.',
          'Delete Failed',
        );
      },
    });
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      Applied: 'status-applied',
      PhoneScreen: 'status-phonescreen',
      TechnicalTask: 'status-technicaltask',
      Interviewing: 'status-interviewing',
      Interview: 'status-interview',
      Offer: 'status-offer',
      Rejected: 'status-rejected',
      Accepted: 'status-accepted',
      Ghosted: 'status-ghosted',
    };
    return statusMap[status] || 'status-unknown';
  }

  /**
   * Get status dot color class for timeline
   */
  getStatusDotClass(status: string): string {
    const dotMap: Record<string, string> = {
      Applied: 'bg-blue-500',
      PhoneScreen: 'bg-cyan-500',
      TechnicalTask: 'bg-yellow-500',
      Interviewing: 'bg-purple-500',
      Interview: 'bg-purple-500',
      Offer: 'bg-green-500',
      Rejected: 'bg-red-500',
      Accepted: 'bg-green-600',
      Ghosted: 'bg-zinc-400',
    };
    return dotMap[status] || 'bg-zinc-400';
  }

  /**
   * Get status badge color class for timeline
   */
  getStatusBadgeClass(status: string): string {
    const badgeMap: Record<string, string> = {
      Applied: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      PhoneScreen: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
      TechnicalTask: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      Interviewing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      Interview: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      Offer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      Accepted: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      Ghosted: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400',
    };
    return badgeMap[status] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatSalary(salary?: number): string {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(salary);
  }

  /**
   * Update notes (for scratchpad)
   */
  updateNotes(value: string): void {
    this.companyNotes.set(value);
    // In production, would save to backend
  }
}
