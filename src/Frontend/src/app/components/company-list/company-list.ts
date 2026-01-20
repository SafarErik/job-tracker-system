import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompanyService } from '../../services/company';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-list.html',
  styleUrl: './company-list.css',
})
export class CompanyListComponent implements OnInit {
  // Signal for companies list
  companies = signal<Company[]>([]);

  // Signal for loading state
  isLoading = signal(true);

  // Signal for error state
  error = signal<string | null>(null);

  // Signal for search filter
  searchTerm = signal('');

  constructor(
    private readonly companyService: CompanyService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  /**
   * Load all companies from the API
   */
  private loadCompanies(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.error.set('Failed to load companies. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Navigate to company details page
   */
  viewCompanyDetails(companyId: number): void {
    this.router.navigate(['/company', companyId]);
  }

  /**
   * Filter companies based on search term
   */
  get filteredCompanies(): Company[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.companies();

    return this.companies().filter(
      (company) =>
        company.name.toLowerCase().includes(term) ||
        company.website?.toLowerCase().includes(term) ||
        company.address?.toLowerCase().includes(term),
    );
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
    this.loadCompanies();
  }

  /**
   * Navigate to add new company (for now, shows alert - can be implemented later)
   */
  addNewCompany(): void {
    // TODO: Implement company creation form
    alert(
      'Add Company feature coming soon! 🚀\n\nFor now, companies are automatically created when you add job applications.',
    );
  }
}
