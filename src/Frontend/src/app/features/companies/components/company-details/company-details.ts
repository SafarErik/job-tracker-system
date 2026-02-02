import { Component, OnInit, signal, ChangeDetectionStrategy, inject, effect, computed, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { toast } from 'ngx-sonner';
import { CompanyNews, CompanyContact } from '../../models/company.model';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLoader2, lucideBuilding2, lucideArrowLeft } from '@ng-icons/lucide';

// Dumb Components
import { CompanyHeaderComponent } from './company-header/company-header';
import { CompanyStatsComponent } from './company-stats/company-stats';
import { CompanyNotesComponent } from './company-notes/company-notes';
import { ContactListComponent } from './contact-list/contact-list';
import { CompanyIntelComponent } from './company-intel/company-intel';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
    ...HlmButtonImports,
    CompanyHeaderComponent,
    CompanyStatsComponent,
    CompanyNotesComponent,
    ContactListComponent,
    CompanyIntelComponent
  ],
  providers: [provideIcons({ lucideLoader2, lucideBuilding2, lucideArrowLeft })],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);
  private readonly intelligenceService = inject(CompanyIntelligenceService);
  private readonly notificationService = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);

  // Read state from service
  company = this.companyService.activeCompany;
  isLoading = this.companyService.isLoading;
  error = this.companyService.error;

  // Local state for Intel (News)
  companyNews = signal<CompanyNews[]>([]);
  newsLoading = signal(false);

  // Local state for Notes (to handle debouncing without glitching)
  companyNotes = signal('');
  private lastCompanyId: string | null = null;

  // Derived state
  successRate = computed(() => {
    const details = this.company();
    if (!details || details.totalApplications === 0) return 0;
    const offers = details.applicationHistory.filter(
      (app) => app.status === 'Offer' || app.status === 'Accepted',
    ).length;
    return Math.round((offers / details.totalApplications) * 100);
  });

  logoUrl = computed(() => {
    const details = this.company();
    if (!details) return null;

    let domain = '';
    if (details.website) {
      try {
        let urlStr = details.website;
        if (!urlStr.startsWith('http')) urlStr = `https://${urlStr}`;
        domain = new URL(urlStr).hostname.replace(/^www\./, '');
      } catch { }
    }

    if (!domain) {
      domain = details.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    }
    return domain ? `https://logo.clearbit.com/${domain}` : null;
  });

  constructor() {
    // Effect to sync notes and load news when company changes
    effect(() => {
      const current = this.company();
      if (current) {
        // Sync notes only if company ID changed to avoid cursor jumps
        if (current.id !== this.lastCompanyId) {
          untracked(() => {
            this.companyNotes.set(current.notes || '');
            this.loadCompanyNews(current.name);
            this.lastCompanyId = current.id;
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.companyService.loadCompanyDetails(id);
      } else {
        this.router.navigate(['/companies']);
      }
    });
  }

  private latestNewsRequestId = 0;
  private loadCompanyNews(name: string): void {
    const requestId = ++this.latestNewsRequestId;
    this.newsLoading.set(true);
    this.intelligenceService.getCompanyNews(name, 3).subscribe({
      next: (news) => {
        if (requestId === this.latestNewsRequestId) {
          this.companyNews.set(news);
          this.newsLoading.set(false);
        }
      },
      error: () => {
        if (requestId === this.latestNewsRequestId) {
          this.newsLoading.set(false);
        }
      }
    });
  }

  // ==========================================
  // Actions
  // ==========================================

  goBack(): void {
    const fromApp = this.route.snapshot.queryParamMap.get('from') === 'application';
    if (fromApp) {
      this.router.navigateByUrl(this.breadcrumbService.getLastWorkstationLink());
    } else {
      this.router.navigate(['/companies']);
    }
  }

  handleUpdateName(name: string): void {
    const current = this.company();
    if (current) {
      this.companyService.updateCompany(current.id, { name }).subscribe({
        error: () => toast.error('Error', { description: 'Failed to update name' })
      });
    }
  }

  handleUpdatePriority(priority: string): void {
    const current = this.company();
    if (current) {
      this.companyService.updateCompany(current.id, { priority }).subscribe({
        next: () => toast.success('Success', { description: 'Priority updated' }),
        error: () => toast.error('Error', { description: 'Failed to update priority' })
      });
    }
  }

  handleUpdateIndustry(industry: string): void {
    const current = this.company();
    if (current) {
      this.companyService.updateCompany(current.id, { industry }).subscribe({
        next: () => toast.success('Success', { description: 'Industry updated' }),
        error: () => toast.error('Error', { description: 'Failed to update industry' })
      });
    }
  }

  async handleDeleteCompany(): Promise<void> {
    const current = this.company();
    if (!current) return;

    const confirmed = await this.notificationService.confirm(
      `This will permanently delete "${current.name}"`,
      'Delete Asset?',
      { confirmText: 'Delete Asset', isDangerous: true }
    );

    if (confirmed) {
      this.companyService.deleteCompany(current.id).subscribe({
        next: () => {
          toast.success('Success', { description: 'Company deleted' });
          this.router.navigate(['/companies']);
        },
        error: () => toast.error('Error', { description: 'Failed to delete company' })
      });
    }
  }

  // Tech Stack Actions
  handleAddTech(skill: string): void {
    const current = this.company();
    if (!current) return;
    const stack = current.techStack || [];
    if (stack.includes(skill)) return;

    this.companyService.updateCompany(current.id, { techStack: [...stack, skill] }).subscribe({
      next: () => toast.success('Updated', { description: 'Skill added' }),
      error: () => toast.error('Error', { description: 'Failed to add skill' })
    });
  }

  handleRemoveTech(skill: string): void {
    const current = this.company();
    if (!current) return;
    const stack = current.techStack || [];
    const newStack = stack.filter(s => s !== skill);

    this.companyService.updateCompany(current.id, { techStack: newStack }).subscribe({
      next: () => toast.success('Updated', { description: 'Skill removed' }),
      error: () => toast.error('Error', { description: 'Failed to remove skill' })
    });
  }

  // Notes Actions
  private notesTimer: any;
  handleNotesChange(notes: string): void {
    this.companyNotes.set(notes); // Update local immediately

    const current = this.company();
    if (!current) return;

    // Clear previous timer
    if (this.notesTimer) clearTimeout(this.notesTimer);

    // Debounce save
    this.notesTimer = setTimeout(() => {
      this.companyService.updateCompany(current.id, { notes }).subscribe();
    }, 1000);
  }

  // Contact Actions
  handleSaveContact(contact: CompanyContact): void {
    const current = this.company();
    if (!current) return;

    const contacts = current.contacts || [];
    let newContacts: CompanyContact[];

    if (!contact.id || contact.id === '0') {
      // Create new
      newContacts = [...contacts, contact];
    } else {
      // Update
      newContacts = contacts.map(c => c.id === contact.id ? contact : c);
    }

    this.companyService.updateCompany(current.id, { contacts: newContacts }).subscribe({
      next: () => {
        this.companyService.loadCompanyDetails(current.id); // Reload to get IDs
        toast.success('Success', { description: 'Contact saved' });
      },
      error: () => toast.error('Error', { description: 'Failed to save contact' })
    });
  }

  async handleDeleteContact(contactId: string): Promise<void> {
    const current = this.company();
    if (!current) return;

    const confirmed = await this.notificationService.confirm(
      'Remove this contact?', 'Confirm Removal', { isDangerous: true }
    );

    if (confirmed) {
      const newContacts = (current.contacts || []).filter(c => c.id !== contactId);
      this.companyService.updateCompany(current.id, { contacts: newContacts }).subscribe({
        next: () => toast.success('Success', { description: 'Contact removed' }),
        error: () => toast.error('Error', { description: 'Failed to remove contact' })
      });
    }
  }

  // Navigation
  viewApplication(appId: string): void {
    const current = this.company();
    this.router.navigate(['/view', appId], {
      queryParams: { from: 'company', companyId: current?.id }
    });
  }
}
