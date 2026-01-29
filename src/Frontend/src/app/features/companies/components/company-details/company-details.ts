import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CompanyDetail, CompanyNews, CompanyContact } from '../../models/company.model';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { HlmCardImports } from '../../../../../../libs/ui/card';
import { HlmBadgeImports } from '../../../../../../libs/ui/badge';
import { HlmInputImports } from '../../../../../../libs/ui/input';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { FormsModule } from '@angular/forms';

import { provideIcons } from '@ng-icons/core';
import {
  lucideGlobe,
  lucideExternalLink,
  lucideLinkedin,
  lucideTrendingUp,
  lucideTrendingDown,
  lucideArrowLeft,
  lucideMoreHorizontal,
  lucidePencil,
  lucideTrash2,
  lucideCalendar,
  lucideMapPin,
  lucideBuilding2,
  lucideLoader2,
  lucideCrown,
  lucideStar,
  lucideCircle,
  lucideChevronDown,
  lucideCheck,
  lucidePlus,
  lucideX
} from '@ng-icons/lucide';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    FormsModule,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmInputImports,
    ...HlmDropdownMenuImports,
  ],
  providers: [
    provideIcons({
      lucideGlobe,
      lucideExternalLink,
      lucideLinkedin,
      lucideTrendingUp,
      lucideTrendingDown,
      lucideArrowLeft,
      lucideMoreHorizontal,
      lucidePencil,
      lucideTrash2,
      lucideCalendar,
      lucideMapPin,
      lucideBuilding2,
      lucideLoader2,
      lucideCrown,
      lucideStar,
      lucideCircle,
      lucideChevronDown,
      lucideCheck,
      lucidePlus,
      lucideX
    }),
  ],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  editingIndustry = signal(false);
  editingTech = signal(false);
  editingContactId = signal<number | null>(null); // null: not editing, 0: new, >0: existing
  newTech = signal('');

  // Contact editing state
  editContactForm = {
    name: signal(''),
    role: signal(''),
    email: signal(''),
    linkedIn: signal('')
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly companyService: CompanyService,
    private readonly intelligenceService: CompanyIntelligenceService,
    private readonly notificationService: NotificationService,
    private readonly breadcrumbService: BreadcrumbService,
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
    const fromApp = this.route.snapshot.queryParamMap.get('from') === 'application';
    if (fromApp) {
      this.router.navigateByUrl(this.breadcrumbService.getLastWorkstationLink());
    } else {
      this.router.navigate(['/companies']);
    }
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

    console.log('[CompanyDetails] Initiating delete for:', details.name);

    const confirmed = await this.notificationService.confirm(
      `This will permanently delete "${details.name}". This action cannot be undone.`,
      'Delete Company?',
      {
        confirmText: 'Delete Asset',
        isDangerous: true,
      },
    );

    console.log('[CompanyDetails] Delete confirmed:', confirmed);

    if (!confirmed) return;

    console.log('[CompanyDetails] Sending delete request to API...');
    this.companyService.deleteCompany(details.id).subscribe({
      next: () => {
        console.log('[CompanyDetails] Delete successful');
        this.notificationService.success(
          `${details.name} has been erased from the registry.`,
          'Asset Deleted',
        );
        this.router.navigate(['/companies']);
      },
      error: (err) => {
        console.error('[CompanyDetails] Delete failed:', err);
        this.notificationService.error(
          'Unable to complete the erasure. Please try again.',
          'Operation Failed',
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
    const s = status.toLowerCase();
    if (s.includes('applied')) return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.3)]';
    if (s.includes('phone')) return 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.3)]';
    if (s.includes('technical')) return 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.3)]';
    if (s.includes('interview')) return 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.3)]';
    if (s.includes('offer')) return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]';
    if (s.includes('accepted')) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]';
    if (s.includes('rejected')) return 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.3)]';
    if (s.includes('ghosted')) return 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.3)]';
    return 'bg-zinc-400';
  }

  /**
   * Get status badge color class for timeline
   */
  getStatusBadgeClass(status: string): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent transition-all';
    const s = status.toLowerCase();

    if (s.includes('applied')) return `${base} bg-blue-500/10 text-blue-600 dark:text-blue-400`;
    if (s.includes('phone')) return `${base} bg-indigo-500/10 text-indigo-600 dark:text-indigo-400`;
    if (s.includes('technical')) return `${base} bg-orange-500/10 text-orange-600 dark:text-orange-400`;
    if (s.includes('interview')) return `${base} bg-violet-500/10 text-violet-600 dark:text-violet-400`;
    if (s.includes('offer')) return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20`;
    if (s.includes('accepted')) return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`;
    if (s.includes('rejected')) return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400`;
    if (s.includes('ghosted')) return `${base} bg-slate-500/10 text-slate-600 dark:text-slate-400`;

    return `${base} bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400`;
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
    const details = this.companyDetails();
    if (!details) return;

    this.companyNotes.set(value);
    this.companyService.updateCompany(details.id, { notes: value }).subscribe({
      error: () => this.notificationService.error('Failed to save notes', 'Error')
    });
  }

  updatePriority(priority: string): void {
    const details = this.companyDetails();
    if (!details || details.priority === priority) return;

    this.companyService.updateCompany(details.id, { priority }).subscribe({
      next: () => {
        this.companyDetails.set({ ...details, priority });
        this.notificationService.success(`Priority updated to ${this.getPriorityLabel(priority)}`, 'Updated');
      },
      error: () => this.notificationService.error('Failed to update priority', 'Error')
    });
  }

  updateIndustry(industry: string): void {
    const details = this.companyDetails();
    if (!details) return;

    this.companyService.updateCompany(details.id, { industry }).subscribe({
      next: () => {
        this.companyDetails.set({ ...details, industry });
        this.notificationService.success('Industry updated', 'Updated');
      },
      error: () => this.notificationService.error('Failed to update industry', 'Error')
    });
  }

  updateTechStack(tech: string): void {
    const details = this.companyDetails();
    if (!details) return;

    const currentStack = details.techStack || [];
    let newStack: string[];

    if (currentStack.includes(tech)) {
      newStack = currentStack.filter(t => t !== tech);
    } else {
      newStack = [...currentStack, tech];
    }

    this.companyService.updateCompany(details.id, { techStack: newStack }).subscribe({
      next: () => {
        this.companyDetails.set({ ...details, techStack: newStack });
        this.notificationService.success('Tech stack updated', 'Updated');
      },
      error: () => this.notificationService.error('Failed to update tech stack', 'Error')
    });
  }

  addTechItem(): void {
    const tech = this.newTech().trim();
    if (!tech) return;

    const details = this.companyDetails();
    if (!details) return;

    const currentStack = details.techStack || [];
    if (currentStack.includes(tech)) {
      this.notificationService.info(`${tech} is already in the stack`, 'Note');
      this.newTech.set('');
      return;
    }

    const newStack = [...currentStack, tech];
    this.companyService.updateCompany(details.id, { techStack: newStack }).subscribe({
      next: () => {
        this.companyDetails.set({ ...details, techStack: newStack });
        this.newTech.set('');
        this.editingTech.set(false);
        this.notificationService.success('Skill added to stack', 'Updated');
      },
      error: () => this.notificationService.error('Failed to add skill', 'Error')
    });
  }

  startAddContact(): void {
    this.editContactForm.name.set('');
    this.editContactForm.role.set('');
    this.editContactForm.email.set('');
    this.editContactForm.linkedIn.set('');
    this.editingContactId.set(0);
  }

  startEditContact(contact: CompanyContact): void {
    this.editContactForm.name.set(contact.name);
    this.editContactForm.role.set(contact.role);
    this.editContactForm.email.set(contact.email || '');
    this.editContactForm.linkedIn.set(contact.linkedIn || '');
    this.editingContactId.set(contact.id);
  }

  cancelContactEdit(): void {
    this.editingContactId.set(null);
  }

  saveContact(): void {
    const details = this.companyDetails();
    if (!details) return;

    const name = this.editContactForm.name().trim();
    const role = this.editContactForm.role().trim();
    if (!name || !role) {
      this.notificationService.info('Name and Role are required', 'Validation');
      return;
    }

    const currentContacts = details.contacts || [];
    let updatedContacts: CompanyContact[];
    const editId = this.editingContactId();

    if (editId === 0) {
      // Add new
      updatedContacts = [...currentContacts, {
        id: 0, // Backend will assign ID
        name,
        role,
        email: this.editContactForm.email().trim() || undefined,
        linkedIn: this.editContactForm.linkedIn().trim() || undefined
      } as CompanyContact];
    } else {
      // Update existing
      updatedContacts = currentContacts.map(c =>
        c.id === editId ? {
          ...c,
          name,
          role,
          email: this.editContactForm.email().trim() || undefined,
          linkedIn: this.editContactForm.linkedIn().trim() || undefined
        } : c
      );
    }

    this.companyService.updateCompany(details.id, { contacts: updatedContacts }).subscribe({
      next: () => {
        // Reload details to get the proper IDs for new contacts
        this.loadCompanyDetails(details.id);
        this.editingContactId.set(null);
        this.notificationService.success(editId === 0 ? 'Member added' : 'Member updated', 'Tactical Success');
      },
      error: () => this.notificationService.error('Failed to sync contact registry', 'Error')
    });
  }

  async deleteContact(contactId: number): Promise<void> {
    const details = this.companyDetails();
    if (!details) return;

    const contact = details.contacts?.find(c => c.id === contactId);
    if (!contact) return;

    const confirmed = await this.notificationService.confirm(
      `Are you sure you want to remove ${contact.name} from the asset's hierarchy?`,
      'Remove Personnel?',
      { confirmText: 'Confirm Removal', isDangerous: true }
    );

    if (!confirmed) return;

    const updatedContacts = (details.contacts || []).filter(c => c.id !== contactId);
    this.companyService.updateCompany(details.id, { contacts: updatedContacts }).subscribe({
      next: () => {
        this.companyDetails.set({ ...details, contacts: updatedContacts });
        this.notificationService.success(`${contact.name} removed`, 'Registry Updated');
      },
      error: () => this.notificationService.error('Failed to update hierarchy', 'Error')
    });
  }

  getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'Tier1': return 'Tier 1: Dream Target';
      case 'Tier2': return 'Tier 2: High Interest';
      case 'Tier3': return 'Tier 3: Opportunistic';
      default: return priority;
    }
  }
}
