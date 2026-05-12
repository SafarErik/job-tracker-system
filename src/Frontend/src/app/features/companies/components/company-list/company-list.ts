import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { CompanyStore } from '../../services/company.store';
import { Company, JobApplicationHistory } from '../../models/company.model';
import { CompanyPriority } from '../../models/company-priority.enum';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { provideIcons, NgIcon } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowRight,
  lucideBriefcase,
  lucideBuilding2,
  lucideCheckCircle2,
  lucideFilter,
  lucideGauge,
  lucideLoader2,
  lucidePlus,
  lucideSearch,
  lucideSparkles,
  lucideTarget,
  lucideUsers,
} from '@ng-icons/lucide';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { LogoPlaceholderComponent } from '../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { CompanyAddSheetComponent } from '../company-add-sheet/company-add-sheet.component';

type CompanyFocusFilter = 'all' | 'active' | 'priority' | 'needsResearch' | 'noPipeline';

interface CompanyFilter {
  id: CompanyFocusFilter;
  labelKey: string;
}

interface CompanyPortfolioInsight {
  eyebrowKey: string;
  titleKey: string;
  bodyKey: string;
  actionKey: string;
  metricKey: string;
  metricValue: number | string;
  icon: string;
}

@Component({
  selector: 'app-company-list',
  imports: [
    CommonModule,
    TranslocoPipe,
    ...HlmButtonImports,
    NgIcon,
    ErrorStateComponent,
    LogoPlaceholderComponent,
    CompanyAddSheetComponent,
  ],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowRight,
      lucideBriefcase,
      lucideBuilding2,
      lucideCheckCircle2,
      lucideFilter,
      lucideGauge,
      lucideLoader2,
      lucidePlus,
      lucideSearch,
      lucideSparkles,
      lucideTarget,
      lucideUsers,
    }),
  ],
  templateUrl: './company-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
  },
})
export class CompanyListComponent implements OnInit {
  private readonly companyStore = inject(CompanyStore);
  private readonly router = inject(Router);

  readonly isLoading = this.companyStore.isLoading;
  readonly error = this.companyStore.error;
  readonly companies = this.companyStore.companies;

  readonly searchTerm = signal('');
  readonly selectedFilter = signal<CompanyFocusFilter>('all');

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  readonly filters: CompanyFilter[] = [
    { id: 'all', labelKey: 'companies.filters.all' },
    { id: 'active', labelKey: 'companies.filters.active' },
    { id: 'priority', labelKey: 'companies.filters.priority' },
    { id: 'needsResearch', labelKey: 'companies.filters.needsResearch' },
    { id: 'noPipeline', labelKey: 'companies.filters.noPipeline' },
  ];

  readonly totalNetwork = computed(() => this.companies().length);
  readonly activePursuits = computed(() =>
    this.companies().filter((company) => this.hasActivePipeline(company)).length,
  );
  readonly priorityTargets = computed(() =>
    this.companies().filter((company) => company.priority === CompanyPriority.TopTier).length,
  );
  readonly needsResearchCount = computed(() =>
    this.companies().filter((company) => this.needsResearch(company)).length,
  );

  readonly portfolioInsight = computed<CompanyPortfolioInsight>(() => {
    const total = this.totalNetwork();

    if (total === 0) {
      return {
        eyebrowKey: 'companies.portfolio.eyebrow.empty',
        titleKey: 'companies.portfolio.empty.title',
        bodyKey: 'companies.portfolio.empty.body',
        actionKey: 'companies.portfolio.empty.action',
        metricKey: 'companies.portfolio.metric.total',
        metricValue: 0,
        icon: 'lucideSparkles',
      };
    }

    if (this.needsResearchCount() > 0) {
      return {
        eyebrowKey: 'companies.portfolio.eyebrow.focus',
        titleKey: 'companies.portfolio.research.title',
        bodyKey: 'companies.portfolio.research.body',
        actionKey: 'companies.portfolio.research.action',
        metricKey: 'companies.portfolio.metric.needsResearch',
        metricValue: this.needsResearchCount(),
        icon: 'lucideGauge',
      };
    }

    if (this.activePursuits() > 0) {
      return {
        eyebrowKey: 'companies.portfolio.eyebrow.pipeline',
        titleKey: 'companies.portfolio.pipeline.title',
        bodyKey: 'companies.portfolio.pipeline.body',
        actionKey: 'companies.portfolio.pipeline.action',
        metricKey: 'companies.portfolio.metric.active',
        metricValue: this.activePursuits(),
        icon: 'lucideBriefcase',
      };
    }

    return {
      eyebrowKey: 'companies.portfolio.eyebrow.watchlist',
      titleKey: 'companies.portfolio.watchlist.title',
      bodyKey: 'companies.portfolio.watchlist.body',
      actionKey: 'companies.portfolio.watchlist.action',
      metricKey: 'companies.portfolio.metric.priority',
      metricValue: this.priorityTargets(),
      icon: 'lucideTarget',
    };
  });

  readonly filteredCompanies = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.companies()
      .filter((company) => {
        const matchesSearch =
          !term ||
          [company.name, company.website, company.address, company.hqLocation, company.industry]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(term));

        if (!matchesSearch) return false;

        switch (filter) {
          case 'active':
            return this.hasActivePipeline(company);
          case 'priority':
            return company.priority === CompanyPriority.TopTier;
          case 'needsResearch':
            return this.needsResearch(company);
          case 'noPipeline':
            return !this.hasActivePipeline(company);
          case 'all':
          default:
            return true;
        }
      })
      .sort((left, right) => this.getCompanyPriorityScore(right) - this.getCompanyPriorityScore(left));
  });

  ngOnInit(): void {
    this.companyStore.loadAll();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.focusSearch();
    }
  }

  focusSearch(): void {
    this.searchInput?.nativeElement?.focus();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  setFilter(filter: CompanyFocusFilter): void {
    this.selectedFilter.set(filter);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedFilter.set('all');
  }

  retry(): void {
    this.companyStore.loadAll();
  }

  viewCompanyDetails(companyId: string): void {
    this.router.navigate(['/companies', companyId]);
  }

  onRowKeyDown(event: KeyboardEvent, companyId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.viewCompanyDetails(companyId);
    }
  }

  getFilterCount(filter: CompanyFocusFilter): number {
    switch (filter) {
      case 'active':
        return this.activePursuits();
      case 'priority':
        return this.priorityTargets();
      case 'needsResearch':
        return this.needsResearchCount();
      case 'noPipeline':
        return this.companies().filter((company) => !this.hasActivePipeline(company)).length;
      case 'all':
      default:
        return this.companies().length;
    }
  }

  hasActivePipeline(company: Company): boolean {
    return this.getActiveApplications(company).length > 0;
  }

  getActiveApplications(company: Company): JobApplicationHistory[] {
    return (company.recentApplications ?? []).filter(
      (application) => !['Rejected', 'Ghosted'].includes(application.status),
    );
  }

  getPrimaryApplication(company: Company): JobApplicationHistory | null {
    return this.getActiveApplications(company)[0] ?? company.recentApplications?.[0] ?? null;
  }

  getResearchCompleteness(company: Company): number {
    let score = 0;
    if (company.website) score += 20;
    if (company.industry) score += 18;
    if (company.address || company.hqLocation) score += 14;
    if (company.description) score += 16;
    if (company.techStack?.length) score += Math.min(16, company.techStack.length * 4);
    if (company.totalApplications > 0) score += 16;
    return Math.min(100, score);
  }

  needsResearch(company: Company): boolean {
    return this.getResearchCompleteness(company) < 58;
  }

  getResearchLabelKey(company: Company): string {
    const score = this.getResearchCompleteness(company);
    if (score >= 76) return 'companies.research.ready';
    if (score >= 50) return 'companies.research.partial';
    return 'companies.research.needsContext';
  }

  getNextActionKey(company: Company): string {
    if (this.needsResearch(company)) return 'companies.nextActions.addContext';
    if (!this.hasActivePipeline(company)) return 'companies.nextActions.findRole';
    if (!company.recentApplications?.length) return 'companies.nextActions.openResearch';
    return 'companies.nextActions.prepare';
  }

  getEvidenceChips(company: Company): string[] {
    const chips = [
      company.industry,
      this.getDomain(company),
      ...(company.techStack ?? []),
    ].filter((item): item is string => Boolean(item?.trim()));

    return [...new Set(chips)].slice(0, 3);
  }

  getDomain(company: Company): string | null {
    if (!company.website) return null;
    try {
      const value = company.website.startsWith('http')
        ? company.website
        : `https://${company.website}`;
      return new URL(value).hostname.replace(/^www\./, '');
    } catch {
      return company.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
  }

  getPriorityLabelKey(priority: CompanyPriority): string {
    switch (priority) {
      case CompanyPriority.TopTier:
        return 'companies.priority.top';
      case CompanyPriority.MidTier:
        return 'companies.priority.mid';
      case CompanyPriority.Archived:
        return 'companies.priority.archived';
      case CompanyPriority.LowTier:
      default:
        return 'companies.priority.low';
    }
  }

  getPriorityClasses(priority: CompanyPriority): string {
    switch (priority) {
      case CompanyPriority.TopTier:
        return 'border-primary/40 bg-primary/10 text-primary';
      case CompanyPriority.MidTier:
        return 'border-accent/35 bg-accent/10 text-accent';
      case CompanyPriority.Archived:
        return 'border-border bg-muted text-muted-foreground';
      case CompanyPriority.LowTier:
      default:
        return 'border-border bg-card text-muted-foreground';
    }
  }

  private getCompanyPriorityScore(company: Company): number {
    let score = 0;
    if (company.priority === CompanyPriority.TopTier) score += 90;
    if (company.priority === CompanyPriority.MidTier) score += 50;
    if (this.hasActivePipeline(company)) score += 70;
    if (this.needsResearch(company)) score += 28;
    score += Math.min(25, this.getResearchCompleteness(company) / 4);
    score += Math.min(20, company.totalApplications * 4);
    if (company.priority === CompanyPriority.Archived) score -= 120;
    return score;
  }
}
