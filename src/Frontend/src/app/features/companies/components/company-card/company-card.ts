import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
  HlmCardFooter,
} from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { CommonModule } from '@angular/common';
import { Company } from '../../models/company.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideChevronRight, lucideCrown, lucideStar, lucideCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmCardFooter,
    HlmBadge,
  ],
  providers: [provideIcons({ lucideBuilding2, lucideMapPin, lucideChevronRight, lucideCrown, lucideStar, lucideCircle })],
  templateUrl: './company-card.html',
  styleUrl: './company-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
   * Get pipeline progress (1-4 segments)
   * Based on the furthest application status
   */
  getPipelineProgress(): number {
    const anyCompany = this.company() as any;
    const apps = anyCompany.recentApplications || anyCompany.RecentApplications;

    if (!apps || apps.length === 0) return 0;

    // Weight map for pipeline stages
    const statusWeights: Record<string, number> = {
      'Applied': 1,
      'Phone Screen': 2,
      'PhoneScreen': 2,
      'Technical Task': 2,
      'TechnicalTask': 2,
      'Interviewing': 3,
      'Interview': 3,
      'In Review': 3,
      'Offer': 4,
      'Accepted': 4,
    };

    let maxWeight = 0;
    console.log(`[Pipeline] Company: ${anyCompany.name}, Apps:`, apps);

    for (const app of apps) {
      const status = app.status?.trim() || '';
      console.log(`[Pipeline] App status: "${status}"`);
      const weight = statusWeights[status] || 1;

      // If rejected/ghosted, it doesn't count towards positive progress in the pipeline
      if (status === 'Rejected' || status === 'Ghosted') continue;

      if (weight > maxWeight) maxWeight = weight;
    }

    return maxWeight;
  }

  /**
   * Navigate to company detail
   */
  onViewDossier(): void {
    this.viewDossier.emit(this.company().id);
  }
}
