import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { CompanyStore } from '../../services/company.store';
import { CompanyIntelligenceService } from '../../services/company-intelligence.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import {
  CompanyContact,
  CompanyDetail,
  CompanyMarketSignal,
  CompanyNextAction,
  CompanyResearchBrief,
  CompanyStrategicInsight,
} from '../../models/company.model';
import { CompanyPriority } from '../../models/company-priority.enum';
import { HlmButtonImports } from '../../../../../../libs/ui/button';
import { ContactListComponent } from './contact-list/contact-list';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle';
import { LogoPlaceholderComponent } from '../../../../shared/components/logo-placeholder/logo-placeholder.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideBriefcase,
  lucideBuilding2,
  lucideCalendarPlus,
  lucideCheckCircle2,
  lucideChevronDown,
  lucideChevronRight,
  lucideClipboard,
  lucideCommand,
  lucideExternalLink,
  lucideFileText,
  lucideGauge,
  lucideGlobe,
  lucideLightbulb,
  lucideLoader2,
  lucideMapPin,
  lucideMaximize2,
  lucideMessageSquare,
  lucideRefreshCw,
  lucideSearch,
  lucideSettings,
  lucideShieldAlert,
  lucideSparkles,
  lucideTarget,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';

type CompanyWorkstationPhase = 'overview' | 'market' | 'applications' | 'people' | 'fit';

interface CompanyPhase {
  id: CompanyWorkstationPhase;
  labelKey: string;
  icon: string;
}

interface CompanyCommandAction {
  id: string;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  phase?: CompanyWorkstationPhase;
  disabled?: () => boolean;
  run: () => void;
}

@Component({
  selector: 'app-company-details',
  imports: [
    CommonModule,
    FormsModule,
    TranslocoPipe,
    NgIcon,
    ...HlmButtonImports,
    ContactListComponent,
    ThemeToggleComponent,
    LogoPlaceholderComponent,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideBriefcase,
      lucideBuilding2,
      lucideCalendarPlus,
      lucideCheckCircle2,
      lucideChevronDown,
      lucideChevronRight,
      lucideClipboard,
      lucideCommand,
      lucideExternalLink,
      lucideFileText,
      lucideGauge,
      lucideGlobe,
      lucideLightbulb,
      lucideLoader2,
      lucideMapPin,
      lucideMaximize2,
      lucideMessageSquare,
      lucideRefreshCw,
      lucideSearch,
      lucideSettings,
      lucideShieldAlert,
      lucideSparkles,
      lucideTarget,
      lucideUsers,
      lucideX,
    }),
  ],
  templateUrl: './company-details.html',
  styleUrl: './company-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
  },
})
export class CompanyDetailsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);
  private readonly companyStore = inject(CompanyStore);
  private readonly intelligenceService = inject(CompanyIntelligenceService);
  private readonly notificationService = inject(NotificationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  private readonly routeParamMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly company = this.companyStore.activeCompany;
  readonly isLoading = this.companyStore.isLoading;
  readonly error = this.companyStore.error;

  readonly currentPhase = signal<CompanyWorkstationPhase>('overview');
  readonly isCommandBarOpen = signal(false);
  readonly commandQuery = signal('');
  readonly commandBarFocusedIndex = signal(0);
  readonly selectedMarketSignal = signal<CompanyMarketSignal | null>(null);
  readonly researchBrief = signal<CompanyResearchBrief | null>(null);
  readonly briefLoading = signal(false);
  readonly copiedBrief = signal(false);
  readonly companyNotes = signal('');

  @ViewChild('commandBarInput') commandBarInput!: ElementRef<HTMLInputElement>;

  private latestBriefRequestId = 0;
  private lastCompanyId: string | null = null;
  private lastLoadedRouteCompanyId: string | null = null;
  private notesTimer: ReturnType<typeof setTimeout> | null = null;

  readonly phases: CompanyPhase[] = [
    { id: 'overview', labelKey: 'companyWorkspace.nav.overview', icon: 'lucideGauge' },
    { id: 'market', labelKey: 'companyWorkspace.nav.market', icon: 'lucideGlobe' },
    { id: 'applications', labelKey: 'companyWorkspace.nav.applications', icon: 'lucideBriefcase' },
    { id: 'people', labelKey: 'companyWorkspace.nav.people', icon: 'lucideUsers' },
    { id: 'fit', labelKey: 'companyWorkspace.nav.fit', icon: 'lucideTarget' },
  ];

  readonly priorityOptions = [
    { value: CompanyPriority.TopTier, labelKey: 'companies.priority.top' },
    { value: CompanyPriority.MidTier, labelKey: 'companies.priority.mid' },
    { value: CompanyPriority.LowTier, labelKey: 'companies.priority.low' },
    { value: CompanyPriority.Archived, labelKey: 'companies.priority.archived' },
  ];

  readonly activeApplications = computed(() => {
    const details = this.company();
    return (details?.applicationHistory ?? []).filter(
      (application) => !['Rejected', 'Ghosted'].includes(application.status),
    );
  });

  readonly readinessScore = computed(() => {
    const brief = this.researchBrief();
    if (brief) return brief.readinessScore;

    const details = this.company();
    if (!details) return 0;

    let score = 42;
    if (details.priority === CompanyPriority.TopTier) score += 14;
    if (details.priority === CompanyPriority.MidTier) score += 8;
    if (details.totalApplications > 0) score += 16;
    if (details.contacts?.length) score += 12;
    if (details.notes?.trim() || details.description?.trim()) score += 12;
    if (details.techStack?.length) score += Math.min(12, details.techStack.length * 2);
    return Math.min(96, score);
  });

  readonly primaryContact = computed(() => this.company()?.contacts?.[0] ?? null);

  readonly commandActions = computed<CompanyCommandAction[]>(() => [
    {
      id: 'refresh-brief',
      labelKey: 'companyWorkspace.command.actions.refreshBrief.label',
      descriptionKey: 'companyWorkspace.command.actions.refreshBrief.description',
      icon: 'lucideRefreshCw',
      disabled: () => this.briefLoading(),
      run: () => this.refreshCompanyBrief(),
    },
    {
      id: 'open-market',
      labelKey: 'companyWorkspace.command.actions.openMarket.label',
      descriptionKey: 'companyWorkspace.command.actions.openMarket.description',
      icon: 'lucideGlobe',
      phase: 'market',
      disabled: () => !this.researchBrief()?.marketSignals?.length,
      run: () => this.setPhase('market'),
    },
    {
      id: 'add-contact',
      labelKey: 'companyWorkspace.command.actions.addContact.label',
      descriptionKey: 'companyWorkspace.command.actions.addContact.description',
      icon: 'lucideUsers',
      phase: 'people',
      run: () => this.focusPeople(),
    },
    {
      id: 'open-application',
      labelKey: 'companyWorkspace.command.actions.openApplication.label',
      descriptionKey: 'companyWorkspace.command.actions.openApplication.description',
      icon: 'lucideBriefcase',
      phase: 'applications',
      disabled: () => !this.activeApplications().length,
      run: () => this.openPrimaryApplication(),
    },
    {
      id: 'prepare-angle',
      labelKey: 'companyWorkspace.command.actions.prepareAngle.label',
      descriptionKey: 'companyWorkspace.command.actions.prepareAngle.description',
      icon: 'lucideLightbulb',
      phase: 'fit',
      run: () => this.prepareInterviewAngle(),
    },
    {
      id: 'copy-brief',
      labelKey: 'companyWorkspace.command.actions.copyBrief.label',
      descriptionKey: 'companyWorkspace.command.actions.copyBrief.description',
      icon: 'lucideClipboard',
      disabled: () => !this.researchBrief(),
      run: () => this.copyBrief(),
    },
  ]);

  readonly filteredCommandActions = computed(() => {
    const query = this.commandQuery().trim().toLowerCase();
    const actions = this.commandActions();
    if (!query) return actions;

    return actions.filter((action) => {
      const label = this.transloco.translate(action.labelKey).toLowerCase();
      const description = this.transloco.translate(action.descriptionKey).toLowerCase();
      return label.includes(query) || description.includes(query);
    });
  });

  readonly logoUrl = computed(() => {
    const details = this.company();
    if (!details?.website) return null;

    try {
      const urlStr = details.website.startsWith('http') ? details.website : `https://${details.website}`;
      const domain = new URL(urlStr).hostname.replace(/^www\./, '');
      return `https://logo.clearbit.com/${domain}`;
    } catch {
      return null;
    }
  });

  constructor() {
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

    effect(() => {
      const current = this.company();
      if (!current || current.id === this.lastCompanyId) return;

      if (this.notesTimer && this.lastCompanyId) {
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
        this.researchBrief.set(null);
        this.refreshCompanyBrief();
        this.lastCompanyId = current.id;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.notesTimer) {
      const current = untracked(this.company);
      if (current) {
        const pendingNotes = untracked(this.companyNotes);
        void this.persistCompanyUpdate(current.id, { notes: pendingNotes });
      }
      clearTimeout(this.notesTimer);
      this.notesTimer = null;
    }

    this.companyStore.clearActiveCompany();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleCommandBar();
    }

    if (event.key === 'Escape') {
      this.closeCommandBar();
      this.closeMarketSignal();
    }
  }

  setPhase(phase: CompanyWorkstationPhase): void {
    this.currentPhase.set(phase);
  }

  toggleCommandBar(): void {
    this.isCommandBarOpen.update((value) => !value);
    if (this.isCommandBarOpen()) {
      setTimeout(() => this.commandBarInput?.nativeElement?.focus(), 0);
    }
  }

  closeCommandBar(): void {
    this.isCommandBarOpen.set(false);
    this.commandQuery.set('');
    this.commandBarFocusedIndex.set(0);
  }

  onCommandQueryChange(query: string): void {
    this.commandQuery.set(query);
    this.commandBarFocusedIndex.set(0);
  }

  onCommandBarKeydown(event: KeyboardEvent): void {
    const buttonCount = this.filteredCommandActions().length;
    if (buttonCount === 0) return;

    const currentIndex = this.commandBarFocusedIndex();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.commandBarFocusedIndex.set((currentIndex + 1) % buttonCount);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.commandBarFocusedIndex.set(currentIndex <= 0 ? buttonCount - 1 : currentIndex - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.executeCommandBarAction(this.filteredCommandActions()[currentIndex]);
    }
  }

  executeCommandBarAction(action: CompanyCommandAction | undefined): void {
    if (!action || this.isCommandActionDisabled(action)) return;
    action.run();
    this.closeCommandBar();
  }

  isCommandActionDisabled(action: CompanyCommandAction): boolean {
    return action.disabled?.() ?? false;
  }

  async refreshCompanyBrief(): Promise<void> {
    const current = this.company();
    if (!current) return;

    const requestId = ++this.latestBriefRequestId;
    this.briefLoading.set(true);

    try {
      const brief = await firstValueFrom(
        this.intelligenceService.generateCompanyResearchBrief(current),
      );
      if (requestId === this.latestBriefRequestId) {
        this.researchBrief.set(brief);
      }
    } catch (error) {
      console.error('Failed to generate company research brief:', error);
      this.notificationService.error(
        this.transloco.translate('companyWorkspace.notifications.briefFailed.body'),
        this.transloco.translate('companyWorkspace.notifications.briefFailed.title'),
      );
    } finally {
      if (requestId === this.latestBriefRequestId) {
        this.briefLoading.set(false);
      }
    }
  }

  goBack(): void {
    const fromApp = this.route.snapshot.queryParamMap.get('from') === 'application';
    if (fromApp) {
      this.router.navigateByUrl(this.breadcrumbService.getLastWorkstationLink());
    } else {
      this.router.navigate(['/companies']);
    }
  }

  viewApplication(appId: string): void {
    const current = this.company();
    this.router.navigate(['/applications', appId], {
      queryParams: { from: 'company', companyId: current?.id },
    });
  }

  openPrimaryApplication(): void {
    const app = this.activeApplications()[0];
    if (app) {
      this.viewApplication(app.id);
      return;
    }

    this.setPhase('applications');
  }

  focusPeople(): void {
    this.setPhase('people');
    this.notificationService.info(
      this.transloco.translate('companyWorkspace.notifications.addContact.body'),
      this.transloco.translate('companyWorkspace.notifications.addContact.title'),
    );
  }

  prepareInterviewAngle(): void {
    this.setPhase('fit');
    this.notificationService.info(
      this.transloco.translate('companyWorkspace.notifications.prepareAngle.body'),
      this.transloco.translate('companyWorkspace.notifications.prepareAngle.title'),
    );
  }

  executeNextAction(action: CompanyNextAction): void {
    this.setPhase(action.target === 'applications' ? 'applications' : action.target);
  }

  openMarketSignal(signal: CompanyMarketSignal): void {
    this.selectedMarketSignal.set(signal);
  }

  closeMarketSignal(): void {
    this.selectedMarketSignal.set(null);
  }

  async copyBrief(): Promise<void> {
    const brief = this.researchBrief();
    const details = this.company();
    if (!brief || !details) return;

    const text = [
      `${details.name} - Company brief`,
      '',
      brief.executiveSummary,
      '',
      'Strategic insights',
      ...brief.strategicInsights.map(
        (insight, index) => `${index + 1}. ${insight.title}: ${insight.recommendation}`,
      ),
      '',
      'Next actions',
      ...brief.nextActions.map((action, index) => `${index + 1}. ${action.label}: ${action.context}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      this.copiedBrief.set(true);
      this.notificationService.success(
        this.transloco.translate('companyWorkspace.notifications.copied.body'),
        this.transloco.translate('companyWorkspace.notifications.copied.title'),
      );
      setTimeout(() => this.copiedBrief.set(false), 2500);
    } catch {
      this.notificationService.error(
        this.transloco.translate('companyWorkspace.notifications.copyFailed.body'),
        this.transloco.translate('companyWorkspace.notifications.copyFailed.title'),
      );
    }
  }

  handlePrioritySelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as CompanyPriority;
    const current = this.company();
    if (!current || current.priority === value) return;

    this.companyStore.update(current.id, { priority: value });
    setTimeout(() => this.refreshCompanyBrief(), 0);
  }

  handleNotesChange(notes: string): void {
    this.companyNotes.set(notes);

    const current = this.company();
    if (!current) return;

    if (this.notesTimer) clearTimeout(this.notesTimer);
    this.notesTimer = setTimeout(() => {
      void this.persistCompanyUpdate(current.id, { notes });
      void this.refreshCompanyBrief();
    }, 800);
  }

  async handleSaveContact(contact: CompanyContact): Promise<void> {
    const current = this.company();
    if (!current) return;

    const contacts = current.contacts || [];
    const nextContacts =
      !contact.id || contact.id === '0'
        ? [...contacts, { ...contact, id: '0' }]
        : contacts.map((item) => (item.id === contact.id ? contact : item));

    const ok = await this.persistCompanyUpdate(current.id, { contacts: nextContacts });
    if (ok) {
      this.companyStore.loadDetails(current.id);
      this.notificationService.success(
        this.transloco.translate('companyWorkspace.notifications.contactSaved.body'),
        this.transloco.translate('companyWorkspace.notifications.contactSaved.title'),
      );
    } else {
      this.notificationService.error(
        this.transloco.translate('companyWorkspace.notifications.contactFailed.body'),
        this.transloco.translate('companyWorkspace.notifications.contactFailed.title'),
      );
    }
  }

  async handleDeleteContact(contactId: string): Promise<void> {
    const current = this.company();
    if (!current) return;

    const confirmed = await this.notificationService.confirm(
      this.transloco.translate('companyWorkspace.people.deleteContactBody'),
      this.transloco.translate('companyWorkspace.people.deleteContactTitle'),
      { isDangerous: true },
    );

    if (!confirmed) return;

    const contacts = (current.contacts || []).filter((contact) => contact.id !== contactId);
    const ok = await this.persistCompanyUpdate(current.id, { contacts });
    if (ok) {
      this.companyStore.loadDetails(current.id);
      this.notificationService.success(
        this.transloco.translate('companyWorkspace.notifications.contactRemoved.body'),
        this.transloco.translate('companyWorkspace.notifications.contactRemoved.title'),
      );
    }
  }

  normalizeWebsiteUrl(website: string | null | undefined): string | null {
    if (!website) return null;
    try {
      const urlStr = website.startsWith('http') ? website : `https://${website}`;
      new URL(urlStr);
      return urlStr;
    } catch {
      return null;
    }
  }

  getWebsiteDomain(company: CompanyDetail): string | null {
    if (!company.website) return null;
    try {
      const url = company.website.startsWith('http') ? company.website : `https://${company.website}`;
      return new URL(url).hostname.replace(/^www\./, '');
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

  getPriorityBadgeClasses(priority: CompanyPriority): string {
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

  getInsightToneClasses(insight: CompanyStrategicInsight): string {
    switch (insight.tone) {
      case 'strength':
        return 'border-success/25 bg-success/5';
      case 'risk':
        return 'border-warning/25 bg-warning/5';
      case 'neutral':
      default:
        return 'border-border bg-background/70';
    }
  }

  getInsightToneIcon(insight: CompanyStrategicInsight): string {
    switch (insight.tone) {
      case 'strength':
        return 'lucideCheckCircle2';
      case 'risk':
        return 'lucideShieldAlert';
      case 'neutral':
      default:
        return 'lucideLightbulb';
    }
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private async persistCompanyUpdate(
    companyId: string,
    changes: {
      notes?: string;
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
