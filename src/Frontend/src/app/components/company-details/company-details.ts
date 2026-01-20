import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company';
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
    this.router.navigate(['/edit', applicationId]);
  }

  /**
   * Navigate back to the main view
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Get CSS class for application status
   */
  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      Applied: 'status-applied',
      Interview: 'status-interview',
      Offer: 'status-offer',
      Rejected: 'status-rejected',
      Accepted: 'status-accepted',
    };

    return statusMap[status] || 'status-unknown';
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
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
