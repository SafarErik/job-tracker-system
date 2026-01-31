import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
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
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
import { SkillSelectorComponent } from '../../../../shared/components/skill-selector/skill-selector';

@Component({
  selector: 'app-company-details',
  imports: [
    CommonModule,
    NgIcon,
    FormsModule,
    ...HlmButtonImports,
    ...HlmCardImports,
    ...HlmBadgeImports,
    ...HlmInputImports,
    ...HlmDropdownMenuImports,
    SkillSelectorComponent,
    ReactiveFormsModule,
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
  editingContactId = signal<number | null>(null); // null: not editing, 0: new, >0: existing

  // Inline Editing State
  editingField = signal<string | null>(null);
  lastSavedField = signal<string | null>(null);

  // Forms
  editForm = inject(FormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  // Contact editing state
  editContactForm = {
    name: signal(''),
    role: signal(''),
    email: signal(''),
    linkedIn: signal('')
  };

  // Priority Options Configuration
  priorityOptions = [
    { value: 'Tier1', label: 'Dream Target', icon: 'lucideCrown', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
    { value: 'Tier2', label: 'High Interest', icon: 'lucideCircle', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20' },
    { value: 'Tier3', label: 'Opportunistic', icon: 'lucideCircle', color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/20' }
  ];

  // Industry Options
  industryOptions = [
    'SaaS', 'Fintech', 'HealthTech', 'AdTech', 'EdTech',
    'E-commerce', 'Cybersecurity', 'Gaming', 'Cloud Infrastructure',
    'AI / ML', 'Blockchain', 'Big Data', 'IoT', 'Robotics'
  ];

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
    if (s.includes('applied')) return 'bg-info shadow-[0_0_8px_hsl(var(--info)/0.3)]';
    if (s.includes('phone')) return 'bg-info shadow-[0_0_8px_hsl(var(--info)/0.3)]';
    if (s.includes('technical')) return 'bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.3)]';
    if (s.includes('interview')) return 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]';
    if (s.includes('offer')) return 'bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.3)]';
    if (s.includes('accepted')) return 'bg-success shadow-[0_0_8px_hsl(var(--success)/0.3)]';
    if (s.includes('rejected')) return 'bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.3)]';
    if (s.includes('ghosted')) return 'bg-muted shadow-[0_0_8px_hsl(var(--muted)/0.3)]';
    return 'bg-secondary';
  }

  /**
   * Get status badge color class for timeline
   */
  getStatusBadgeClass(status: string): string {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent transition-all';
    const s = status.toLowerCase();

    if (s.includes('applied')) return `${base} bg-info/10 text-info border-info/20`;
    if (s.includes('phone')) return `${base} bg-info/15 text-info border-info/30`;
    if (s.includes('technical')) return `${base} bg-warning/10 text-warning border-warning/20`;
    if (s.includes('interview')) return `${base} bg-primary/10 text-primary border-primary/20`;
    if (s.includes('offer')) return `${base} bg-warning/15 text-warning border-warning/30`;
    if (s.includes('accepted')) return `${base} bg-success/10 text-success border-success/20`;
    if (s.includes('rejected')) return `${base} bg-destructive/10 text-destructive border-destructive/20`;
    if (s.includes('ghosted')) return `${base} bg-muted text-muted-foreground border-border`;

    return `${base} bg-secondary text-secondary-foreground border-border`;
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

  private notesSaveTimer?: any;

  /**
   * Update notes (for scratchpad)
   */
  updateNotes(value: string): void {
    const details = this.companyDetails();
    if (!details) return;

    this.companyNotes.set(value);

    if (this.notesSaveTimer) {
      clearTimeout(this.notesSaveTimer);
    }

    this.notesSaveTimer = setTimeout(() => {
      this.companyService.updateCompany(details.id, { notes: value }).subscribe({
        error: () => this.notificationService.error('Failed to save notes', 'Error')
      });
    }, 1000);
  }

  updatePriority(priority: string): void {
    const details = this.companyDetails();
    if (!details || details.priority === priority) return;

    this.companyService.updateCompany(details.id, { priority }).subscribe({
      next: () => {
        this.companyDetails.update(prev => prev ? { ...prev, priority } : null);
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
        this.companyDetails.update(prev => prev ? { ...prev, industry } : null);
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
        this.companyDetails.update(prev => prev ? { ...prev, techStack: newStack } : null);
        this.notificationService.success('Tech stack updated', 'Updated');
      },
      error: () => this.notificationService.error('Failed to update tech stack', 'Error')
    });
  }

  removeTechItem(skill: string): void {
    const details = this.companyDetails();
    if (!details) return;

    const currentStack = details.techStack || [];
    const newStack = currentStack.filter(t => t !== skill);

    if (newStack.length === currentStack.length) return; // Nothing removed

    this.companyService.updateCompany(details.id, { techStack: newStack }).subscribe({
      next: () => {
        this.companyDetails.update(prev => prev ? { ...prev, techStack: newStack } : null);
        this.notificationService.success('Skill removed from stack', 'Updated');
      },
      error: () => this.notificationService.error('Failed to remove skill', 'Error')
    });
  }

  addTechItem(skill: string): void {
    const details = this.companyDetails();
    if (!details) return;

    const currentStack = details.techStack || [];
    if (currentStack.includes(skill)) {
      this.notificationService.info(`${skill} is already in the stack`, 'Note');
      return;
    }

    const newStack = [...currentStack, skill];
    this.companyService.updateCompany(details.id, { techStack: newStack }).subscribe({
      next: () => {
        this.companyDetails.update(prev => prev ? { ...prev, techStack: newStack } : null);
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
    this.editContactForm.role.set(contact.role || '');
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
        this.companyDetails.update(prev => prev ? { ...prev, contacts: updatedContacts } : null);
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

  startEditing(field: string): void {
    const details = this.companyDetails();
    if (!details) return;

    if (field === 'name') {
      this.editForm.patchValue({ name: details.name });
    }

    this.editingField.set(field);
  }

  saveField(field: string): void {
    const details = this.companyDetails();
    if (!details) return;

    if (field === 'name') {
      const formControl = this.editForm.get('name');
      const rawValue = formControl?.value;
      const newName = rawValue?.trim();

      if (!formControl?.valid || !newName) {
        // Optionally inform user if invalid, or just revert if empty
        if (!newName) {
          this.notificationService.info('Company name cannot be empty', 'Validation');
        }
        // Keep editing or revert? As per request "show notifications in both success and error branches"
        // If invalid, maybe just don't save. But user interface needs feedback. 
        // Request says: "check editForm.valid (or specifically that trimmed name is non-empty...) ... ensure you still clear editingField... as before"
        // Actually request says: 'only then call companyService.updateCompany... ensure you still clear editingField and show notifications'
        // If validation fails, I should probably NOT clear editing field so they can fix it? 
        // "ensure you still clear editingField ... in both success and error branches" likely refers to API error.
        // But let's assume if validation fails we might want to simply stop editing and revert or warn. 
        // Let's warn and stop editing (revert) as is standard behavior for "cancel" or failed validation in non-persistent forms, 
        // OR keep it open.
        // The prompt says: "update saveField to run the editForm validators ... check editForm.valid ... and only then call ... ensure you still clear editingField ... in both success and error branches as before"
        // "As before" meant the API subscribe blocks.
        // Let's be strict: If invalid, do not save, maybe warn, but if we don't clear editingField they are stuck? 
        // I will assume if name is invalid (empty), we might just revert or show error.
        // Let's show warning and NOT clear editingField so they can fix it?
        // No, the prompt implies "updateField" flow. 
        // "ensure you still clear editingField ... in both success and error branches as before" refers to the API call result.
        // If validation fails, I will just show a warning and return (keeping edit mode open). 
        // Wait, if I blur, it calls saveField. If I return, edit mode stays? Yes. That sounds better than reverting logic.

        // However, looking at the code `(blur)="saveField('name')"` -> if I don't clear editingField context, 
        // `blur` event happened, focus is lost. 
        // If I don't clear `editingField`, the UI stays in "input mode" but focus is gone. 
        // User clicks away -> blur -> validation error -> stays input. 
        // That might be annoying.
        // Let's look at the instruction again: "ensure you still clear editingField and show notifications in both success and error branches as before" -> "referencing saveField, editForm, companyService.updateCompany...".
        // The "success and error branches" refers to the Observable subscription.
        // What about validation failure?
        // I'll implement: If invalid, notify and keep editing (or revert if better). 
        // Actually, if it's invalid (empty), usually we revert to previous value.
        // I will revert if empty/invalid for better UX on blur.

        if (!newName || newName.length === 0) {
          this.notificationService.info('Company name cannot be empty', 'Validation');
          this.editingField.set(null); // Revert
          return;
        }
        return;
      }

      if (newName === details.name) {
        this.editingField.set(null);
        return;
      }

      this.companyService.updateCompany(details.id, { name: newName }).subscribe({
        next: () => {
          this.companyDetails.update(prev => prev ? { ...prev, name: newName } : null);
          this.editingField.set(null);
          this.lastSavedField.set(field);
          this.notificationService.success('Company name updated', 'Success');
          setTimeout(() => this.lastSavedField.set(null), 2000);
        },
        error: () => {
          this.notificationService.error('Failed to update company name', 'Error');
          this.editingField.set(null);
        }
      });
    }
  }
}
