import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { CompanyStore } from '../../services/company.store';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  CompanyNews,
  CompanyContact,
  IntelligenceBriefing,
  TacticalEvent,
} from '../../models/company.model';
import { CompanyPriority } from '../../models/company-priority.enum';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLoader2,
  lucideBuilding2,
  lucideArrowLeft,
  lucideLayoutDashboard,
  lucideSearch,
  lucideGlobe,
  lucideSettings,
  lucideCalendarPlus,
  lucideBriefcase,
  lucideUsers,
  lucideCpu,
  lucideTrendingUp,
  lucideShieldCheck,
  lucideZap,
  lucideAlertTriangle,
  lucideChevronRight,
  lucideActivity,
} from '@ng-icons/lucide';

// Dumb Components
import { CompanyHeaderComponent } from './company-header/company-header';
import { CompanyStatsComponent } from './company-stats/company-stats';
import { CompanyNotesComponent } from './company-notes/company-notes';
import { CompanyIntelComponent } from './company-intel/company-intel';
import { InterviewTacticsComponent } from './interview-tactics/interview-tactics';
import { AiAnalystChatComponent } from './ai-analyst-chat/ai-analyst-chat';
import { MissionControlComponent } from './mission-control/mission-control.component';
import { IntelligenceLabComponent } from './intelligence-lab/intelligence-lab.component';
import { EngagementLogComponent } from './engagement-log/engagement-log.component';

@Component({
  selector: 'app-company-details',
  imports: [
    CommonModule,
    NgIcon,
    ...HlmButtonImports,
    CompanyHeaderComponent,
    CompanyStatsComponent,
    CompanyNotesComponent,
    CompanyIntelComponent,
    InterviewTacticsComponent,
    AiAnalystChatComponent,
    MissionControlComponent,
    IntelligenceLabComponent,
    EngagementLogComponent,
  ],
  providers: [
    provideIcons({
      lucideLoader2,
      lucideBuilding2,
      lucideArrowLeft,
      lucideLayoutDashboard,
      lucideSearch,
      lucideGlobe,
      lucideSettings,
      lucideCalendarPlus,
      lucideBriefcase,
      lucideUsers,
      lucideCpu,
      lucideTrendingUp,
      lucideShieldCheck,
      lucideZap,
      lucideAlertTriangle,
      lucideChevronRight,
      lucideActivity,
    }),
  ],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyDetailsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);
  private readonly companyStore = inject(CompanyStore);
  private readonly intelligenceService = inject(CompanyIntelligenceService);
  private readonly notificationService = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly routeParamMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  // Read state from store
  company = this.companyStore.activeCompany;
  isLoading = this.companyStore.isLoading;
  error = this.companyStore.error;

  // Local state for Intel (News)
  companyNews = signal<CompanyNews[]>([]);
  newsLoading = signal(false);

  // AI Briefing State
  intelligenceBriefing = signal<IntelligenceBriefing | null>(null);
  briefingLoading = signal(false);
  private latestBriefingRequestId = 0;
  private latestNewsRequestId = 0;
  private lastLoadedRouteCompanyId: string | null = null;

  // Timeline State
  manualEvents = signal<TacticalEvent[]>([]); // For manual adds in this session

  // Tab Navigation State
  activeTab = signal<'overview' | 'intelligence' | 'marketPulse' | 'ecosystem'>('overview');

  // Local state for Notes (to handle debouncing without glitching)
  companyNotes = signal('');
  private lastCompanyId: string | null = null;

  // Derived state
  successRate = computed(() => {
    const details = this.company();
    // Guard against missing/zero applications or undefined history
    if (!details?.totalApplications) return 0;

    const history = details.applicationHistory || [];
    const offers = history.filter(
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
      } catch {}
    }

    if (!domain) {
      domain = details.name.toLowerCase().replaceAll(/[^a-z0-9]/g, '') + '.com';
    }
    return domain ? `https://logo.clearbit.com/${domain}` : null;
  });

  normalizeWebsiteUrl(website: string | null | undefined): string | null {
    if (!website) return null;
    try {
      let urlStr = website;
      if (!urlStr.startsWith('http')) urlStr = `https://${urlStr}`;
      // Validate URL is valid
      new URL(urlStr);
      return urlStr;
    } catch {
      return null;
    }
  }

  activeApplications = computed(() => {
    const details = this.company();
    return details?.applicationHistory || [];
  });

  primaryContacts = computed(() => {
    const details = this.company();
    return (details?.contacts || []).slice(0, 3);
  });

  dossierSnippet = computed(() => {
    const briefing = this.intelligenceBriefing();
    if (!briefing?.mission) return null;

    // Split by newlines and take the first paragraph
    return briefing.mission.split('\n').find((paragraph) => paragraph.trim().length > 0) ?? null;
  });

  compatibilityIndex = computed(() => {
    const details = this.company();
    if (!details) return null;

    // Simulated intelligence logic
    let score = 62;
    if (details.priority === CompanyPriority.TopTier) {
      score = 94;
    } else if (details.priority === CompanyPriority.MidTier) {
      score = 78;
    }

    return {
      score,
      pros: [
        'Strong overlap with core technical stack',
        'Company culture favors individual contributor growth',
      ],
      cons: [
        'Geographic distance might require hybrid negotiation',
        'Recent leadership transition could shift project focus',
      ],
    };
  });

  // Engagement Log moved to Application Timeline

  constructor() {
    // Effect to sync notes and load news when company changes
    effect(() => {
      const current = this.company();
      if (current) {
        // Sync notes only if company ID changed to avoid cursor jumps
        if (current.id !== this.lastCompanyId) {
          // Flush pending notes save if switching companies
          if (this.notesTimer && this.lastCompanyId) {
            // Use untracked to read the signal without creating a dependency
            const pendingNotes = untracked(() => this.companyNotes());
            const oldId = this.lastCompanyId;
            untracked(() => {
              void this.persistCompanyUpdate(oldId, { notes: pendingNotes });
            });
            clearTimeout(this.notesTimer);
            this.notesTimer = null;
          }

          untracked(() => {
            this.companyNotes.set(current.notes || '');
            this.loadCompanyNews(current.name);
            this.handleRegenerateBriefing(); // Load initial briefing
            this.lastCompanyId = current.id;
          });
        }
      }
    });
    effect(() => {
      const id = this.routeParamMap().get('id');
      if (!id) {
        void this.router.navigate(['/companies']);
        return;
      }

      if (id !== this.lastLoadedRouteCompanyId) {
        this.lastLoadedRouteCompanyId = id;
        this.companyStore.loadDetails(id);
      }
    });
  }

  ngOnDestroy(): void {
    // Check for pending notes and save immediately
    if (this.notesTimer) {
      const current = untracked(this.company);
      if (current) {
        const pendingNotes = untracked(this.companyNotes);
        void this.persistCompanyUpdate(current.id, { notes: pendingNotes });
      }
      clearTimeout(this.notesTimer);
      this.notesTimer = null;
    }

    // Clear active company state to free memory when leaving detail view
    this.companyStore.clearActiveCompany();
  }

  async handleRegenerateBriefing(): Promise<void> {
    const current = this.company();
    if (!current) return;

    const requestId = ++this.latestBriefingRequestId;
    this.briefingLoading.set(true);
    try {
      const briefing = await firstValueFrom(
        this.intelligenceService.generateIntelligenceBriefing(current.name),
      );
      if (requestId === this.latestBriefingRequestId) {
        this.intelligenceBriefing.set(briefing);
      }
    } catch (error) {
      console.error('Failed to generate intelligence briefing:', error);
      this.notificationService.error('Failed to generate briefing', 'Please try again');
    } finally {
      if (requestId === this.latestBriefingRequestId) {
        this.briefingLoading.set(false);
      }
    }
  }

  async loadCompanyNews(name: string): Promise<void> {
    const requestId = ++this.latestNewsRequestId;
    this.newsLoading.set(true);
    try {
      const news = await firstValueFrom(this.intelligenceService.getCompanyNews(name, 3));
      if (requestId === this.latestNewsRequestId) {
        this.companyNews.set(news);
      }
    } catch {
      if (requestId === this.latestNewsRequestId) {
        this.companyNews.set([]);
      }
    } finally {
      if (requestId === this.latestNewsRequestId) {
        this.newsLoading.set(false);
      }
    }
  }

  // ==========================================
  // Actions
  // ==========================================

  // Tab Actions
  setTab(tab: 'overview' | 'intelligence' | 'marketPulse' | 'ecosystem'): void {
    this.activeTab.set(tab);
  }

  handleSummarizeNews(): void {
    const current = this.company();
    if (!current) return;

    this.notificationService.info('Synthesizing market intelligence...', 'AI Analyst');
    setTimeout(() => {
      this.notificationService.success('Company context summary updated.', 'Summary ready');
    }, 2000);
  }

  addManualEvent(): void {
    const newEvent: TacticalEvent = {
      id: crypto.randomUUID(),
      type: 'Networking',
      date: new Date(),
      title: 'Coffee Chat with Tech Lead',
      subtitle: 'Internal referral opportunity',
      description: 'Discussed clean architecture and team culture. Strong positive signal.',
      meta: { aiInsight: 'High potential for internal referral. Follow up in 3 days.' },
    };
    this.manualEvents.update((events) => [newEvent, ...events]);
    this.notificationService.success('Timeline updated.', 'Event logged');
  }

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
      this.companyStore.update(current.id, { name });
    }
  }

  handleUpdatePriority(priority: string): void {
    const current = this.company();
    if (current) {
      this.companyStore.update(current.id, { priority: priority as CompanyPriority });
    }
  }

  handleUpdateIndustry(industry: string): void {
    const current = this.company();
    if (current) {
      this.companyStore.update(current.id, { industry });
    }
  }

  async handleDeleteCompany(): Promise<void> {
    const current = this.company();
    if (!current) return;

    const confirmed = await this.notificationService.confirm(
      `This will permanently delete "${current.name}"`,
      'Delete company?',
      { confirmText: 'Delete company', isDangerous: true },
    );

    if (confirmed) {
      this.companyStore.delete(current.id);
      this.router.navigate(['/companies']);
    }
  }

  handleOpenSettings(): void {
    this.notificationService.info('Company settings are coming soon.', 'Settings');
  }

  // Tech Stack Actions
  async handleAddTech(skill: string): Promise<void> {
    if (!skill) {
      this.notificationService.info(
        'Skill selection is unavailable right now.',
        'Company research',
      );
      return;
    }
    const current = this.company();
    if (!current) return;
    const stack = current.techStack || [];
    if (stack.includes(skill)) return;

    const ok = await this.persistCompanyUpdate(current.id, { techStack: [...stack, skill] });
    if (ok) {
      this.notificationService.success('Skill added', 'Updated');
    } else {
      this.notificationService.error('Failed to add skill', 'Error');
    }
  }

  async handleRemoveTech(skill: string): Promise<void> {
    const current = this.company();
    if (!current) return;
    const stack = current.techStack || [];
    const newStack = stack.filter((s) => s !== skill);

    const ok = await this.persistCompanyUpdate(current.id, { techStack: newStack });
    if (ok) {
      this.notificationService.success('Skill removed', 'Updated');
    } else {
      this.notificationService.error('Failed to remove skill', 'Error');
    }
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
      void this.persistCompanyUpdate(current.id, { notes });
    }, 1000);
  }

  // Contact Actions
  async handleSaveContact(contact: CompanyContact): Promise<void> {
    const current = this.company();
    if (!current) return;

    const contacts = current.contacts || [];
    let newContacts: CompanyContact[];

    if (!contact.id || contact.id === '0') {
      // Create new
      newContacts = [...contacts, { ...contact, id: '0' }];
    } else {
      // Update
      newContacts = contacts.map((c) => (c.id === contact.id ? contact : c));
    }

    const ok = await this.persistCompanyUpdate(current.id, { contacts: newContacts });
    if (ok) {
      this.companyStore.loadDetails(current.id);
      this.notificationService.success('Contact saved', 'Success');
    } else {
      this.notificationService.error('Failed to save contact', 'Error');
    }
  }

  async handleDeleteContact(contactId: string): Promise<void> {
    const current = this.company();
    if (!current) return;

    const confirmed = await this.notificationService.confirm(
      'Remove this contact?',
      'Confirm Removal',
      { isDangerous: true },
    );

    if (confirmed) {
      const newContacts = (current.contacts || []).filter((c) => c.id !== contactId);
      const ok = await this.persistCompanyUpdate(current.id, { contacts: newContacts });
      if (ok) {
        this.notificationService.success('Contact removed', 'Success');
      } else {
        this.notificationService.error('Failed to remove contact', 'Error');
      }
    }
  }

  // Navigation
  viewApplication(appId: string): void {
    const current = this.company();
    this.router.navigate(['/view', appId], {
      queryParams: { from: 'company', companyId: current?.id },
    });
  }

  formatDate(dateString: string | Date | undefined): string | null {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  private async persistCompanyUpdate(
    companyId: string,
    changes: {
      notes?: string;
      techStack?: string[];
      contacts?: CompanyContact[];
    },
  ): Promise<boolean> {
    try {
      await firstValueFrom(this.companyService.updateCompany(companyId, changes));
      return true;
    } catch {
      return false;
    }
  }
}
