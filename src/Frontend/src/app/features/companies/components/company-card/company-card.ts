import { Component, input, output } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
  HlmCardFooter,
} from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import { CommonModule } from '@angular/common';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-company-card',
  imports: [
    CommonModule,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmCardFooter,
    HlmButton,
  ],
  templateUrl: './company-card.html',
  styleUrl: './company-card.css',
})
export class CompanyCardComponent {
  company = input.required<Company>();
  viewDossier = output<number>();

  logoFailed = false;

  // Mock tech stacks for demo if not provided
  private readonly mockTechStacks = [
    ['Angular', '.NET', 'Azure', 'PostgreSQL'],
    ['React', 'Node.js', 'AWS', 'MongoDB'],
    ['Vue.js', 'Python', 'GCP', 'Redis'],
    ['TypeScript', 'Java', 'Kubernetes', 'MySQL'],
    ['Next.js', 'Go', 'Docker', 'Elasticsearch'],
  ];

  /**
   * Get website domain from company website or name
   */
  getWebsiteDomain(): string {
    const website = this.company().website;
    if (website) {
      try {
        const url = new URL(website);
        return url.hostname.replace('www.', '');
      } catch {
        // If URL parsing fails, extract domain pattern
        const match = website.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
        return match?.[1] || '';
      }
    }
    // Fallback: generate from company name only if valid
    const name = this.company()
      .name.toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    return name ? `${name}.com` : '';
  }

  /**
   * Get Clearbit logo URL using website domain
   */
  getLogoUrl(): string | null {
    if (this.logoFailed) return null;
    const domain = this.getWebsiteDomain();
    return domain ? `https://logo.clearbit.com/${domain}` : null;
  }

  /**
   * Handle logo load error - fallback to building icon
   */
  onLogoError(): void {
    this.logoFailed = true;
  }

  /**
   * Get tech stack - use actual data or mock for demo
   */
  getTechStack(): string[] {
    const actual = this.company().techStack;
    if (actual && actual.length > 0) return actual;

    // Mock data for demo - deterministic based on company ID
    const index = this.company().id % this.mockTechStacks.length;
    return this.mockTechStacks[index];
  }

  /**
   * Get limited tech stack (max 3 items)
   */
  getVisibleTechStack(): string[] {
    return this.getTechStack().slice(0, 3);
  }

  /**
   * Count of remaining tech items
   */
  getRemainingTechCount(): number {
    const total = this.getTechStack().length;
    return Math.max(0, total - 3);
  }

  /**
   * Check if company has active applications
   */
  hasApplications(): boolean {
    return this.company().totalApplications > 0;
  }

  /**
   * Navigate to company detail
   */
  onViewDossier(): void {
    this.viewDossier.emit(this.company().id);
  }
}
