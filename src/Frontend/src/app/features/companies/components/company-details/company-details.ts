import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CompanyDetail } from '../../models/company.model';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css',
})
export class CompanyDetailsComponent implements OnInit {
  // Signal for company details
  companyDetails = signal<CompanyDetail | null>(null);

  // Signal for loading state
  isLoading = signal(true);

  // Signal for error state
  error = signal<string | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly companyService: CompanyService,
    private readonly notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    // Get company ID from route parameters
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
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading company details:', err);
        this.error.set('Failed to load company details. Please try again.');
        this.isLoading.set(false);
      },
    });
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

  /**
   * Navigate back to the company list
   */
  goBack(): void {
    this.router.navigate(['/companies']);
  }

  /**
   * Navigate to edit company
   */
  editCompany(): void {
    const details = this.companyDetails();
    if (details) {
      this.router.navigate(['/companies/edit', details.id]);
    }
  }

  /**
   * Delete current company
   */
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

  /**
   * Get CSS class for application status
   */
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
   * Format date for display
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format salary for display
   */
  formatSalary(salary?: number): string {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(salary);
  }
}
