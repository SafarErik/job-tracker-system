import { Component, input, output, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardContent,
  HlmCardFooter,
} from '@spartan-ng/helm/card';
import { CommonModule } from '@angular/common';
import { Company } from '../../models/company.model';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideMapPin, lucideChevronRight, lucideCrown, lucideStar, lucideCircle } from '@ng-icons/lucide';
import { ProfileStore } from '../../../../features/profile/services/profile.store';

@Component({
  selector: 'app-company-card',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    HlmCard,
    HlmCardHeader,
    HlmCardContent,
    HlmCardFooter,
  ],
  providers: [provideIcons({ lucideBuilding2, lucideMapPin, lucideChevronRight, lucideCrown, lucideStar, lucideCircle })],
  templateUrl: './company-card.html',
  styleUrl: './company-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyCardComponent {
  private readonly profileStore = inject(ProfileStore);
  company = input.required<Company>();
  viewDossier = output<string>();

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
  readonly websiteDomain = computed(() => {
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
  });

  /**
   * Get Clearbit logo URL using website domain
   */
  readonly logoUrl = computed(() => {
    const domain = this.websiteDomain();
    return domain ? `https://logo.clearbit.com/${domain}` : null;
  });

  /**
   * Get tech stack - use actual data or mock for demo
   */
  readonly techStack = computed(() => {
    const actual = this.company().techStack;
    if (actual && actual.length > 0) return actual;

    // Mock data for demo - deterministic based on company ID
    // Simplified hash for string ID
    const hash = this.company().id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % this.mockTechStacks.length;
    return this.mockTechStacks[index];
  });

  /**
   * Get limited tech stack (max 3 items)
   */
  readonly visibleTechStack = computed(() => {
    return this.techStack().slice(0, 3);
  });

  /**
   * Count of remaining tech items
   */
  readonly remainingTechCount = computed(() => {
    const total = this.techStack().length;
    return Math.max(0, total - 3);
  });

  /**
   * Check if company has active applications
   */
  readonly hasApplications = computed(() => {
    return this.company().totalApplications > 0;
  });

  /**
   * Get first letter of company name for avatar
   */
  readonly firstLetter = computed(() => {
    return this.company().name.charAt(0).toUpperCase();
  });

  /**
   * Get color class for tech stack chips
   * Highlights matched skills in Obsidian (Purple/Violet)
   * Others in Blue theme
   */
  getTechColor(tech: string): string {
    const isMatched = this.profileStore.hasSkill(tech);

    if (isMatched) {
      // Obsidian / Purple theme for matched skills
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 hover:border-violet-500/40';
    }

    // Default Blue theme for unmatched skills
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/40';
  }

  /**
   * Get pipeline progress (1-4 segments)
   * Based on the furthest application status
   */
  readonly pipelineProgress = computed(() => {
    const company = this.company();
    const apps = company.recentApplications;

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

    for (const app of apps) {
      const status = app.status?.trim() || '';
      const weight = statusWeights[status] || 1;

      // If rejected/ghosted, it doesn't count towards positive progress in the pipeline
      if (status === 'Rejected' || status === 'Ghosted') continue;

      if (weight > maxWeight) maxWeight = weight;
    }

    return maxWeight;
  });

  /**
   * Handle logo load error - fallback to building icon
   */
  onLogoError(): void {
    this.logoFailed = true;
  }

  /**
   * Navigate to company detail
   */
  onViewDossier(): void {
    this.viewDossier.emit(this.company().id);
  }
}
