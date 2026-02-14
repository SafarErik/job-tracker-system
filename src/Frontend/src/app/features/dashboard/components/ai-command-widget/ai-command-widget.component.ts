import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { BrnSwitchImports } from '@spartan-ng/brain/switch';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  ArrowUp,
  CircleDashed,
  Database,
  Globe,
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  Mic,
  Paperclip,
  Sparkles,
} from 'lucide-angular';

export interface AiInsightCard {
  id: string;
  icon: string;
  title: string;
  action: string;
  command?: string;
}

export interface AiCopilotContext {
  totalApplications: number;
  activePipeline: number;
  offers: number;
  dueFollowUps: number;
  topCompany?: string;
}

type SourceToggleKey = 'webSearch' | 'myResume' | 'marketNews';
type ChatMode = 'Fast' | 'Deep Reason';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: string[];
}

@Component({
  selector: 'app-ai-command-widget',
  imports: [
    CommonModule,
    TextFieldModule,
    LucideAngularModule,
    ...HlmButtonImports,
    ...HlmPopoverImports,
    ...BrnSwitchImports,
    ...HlmSwitchImports,
  ],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        ArrowUp,
        CircleDashed,
        Database,
        Globe,
        Mic,
        Paperclip,
        Sparkles,
      }),
    },
  ],
  templateUrl: './ai-command-widget.component.html',
  styleUrl: './ai-command-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiCommandWidgetComponent {
  private readonly sanitizer = inject(DomSanitizer);

  title = input('AI Assistant');
  insightCards = input.required<AiInsightCard[]>();
  placeholder = input('Ask anything about your career or companies...');
  context = input.required<AiCopilotContext>();

  readonly command = signal('');
  readonly chatMode = signal<ChatMode>('Fast');
  readonly availableModes: ChatMode[] = ['Fast', 'Deep Reason'];
  readonly sourceToggles = signal<Record<SourceToggleKey, boolean>>({
    webSearch: true,
    myResume: true,
    marketNews: false,
  });
  readonly attachedFiles = signal<string[]>([]);
  readonly messages = signal<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        '### Welcome\nI can help with:\n- Pipeline summaries\n- Follow-up strategy\n- Interview preparation\n\nTry asking for a **next best action**.',
      citations: ['Dashboard Metrics'],
    },
  ]);

  readonly commandSuggestions = computed(() => {
    const pending = this.context().dueFollowUps;

    return pending > 0
      ? ['summary', 'next action', 'follow-ups', 'interview prep']
      : ['summary', 'next action', 'pipeline', 'offer strategy'];
  });

  readonly quickPrompts = computed(() => [...this.commandSuggestions()].slice(0, 4));
  readonly hasCommand = computed(() => this.command().trim().length > 0);
  readonly sourceTriggerLabel = computed(() => {
    const toggles = this.sourceToggles();

    if (toggles.webSearch && toggles.myResume && toggles.marketNews) {
      return 'All Sources';
    }

    const activeCount = [toggles.webSearch, toggles.myResume, toggles.marketNews].filter(
      Boolean,
    ).length;
    if (activeCount === 0) {
      return 'Sources';
    }

    return `${activeCount} source${activeCount === 1 ? '' : 's'}`;
  });
  readonly sourceCitations = computed(() => {
    const toggles = this.sourceToggles();
    const citations: string[] = [];

    if (toggles.webSearch) {
      citations.push('Web Search');
    }

    if (toggles.myResume) {
      citations.push('My Resume');
    }

    if (toggles.marketNews) {
      citations.push('Market News');
    }

    return citations;
  });
  readonly chatModeDescription = computed(() =>
    this.chatMode() === 'Fast'
      ? 'Fast mode returns concise answers.'
      : 'Deep Reason mode returns fuller analysis.',
  );

  trackByInsight(_: number, card: AiInsightCard): string {
    return card.id;
  }

  updateCommand(value: string): void {
    this.command.set(value);
  }

  runCommand(rawCommand?: string): void {
    const command = (rawCommand ?? this.command()).trim();
    const normalized = command.toLowerCase();

    if (!command) {
      return;
    }

    const response = this.applyModeToResponse(this.getResponseFor(normalized));
    const citations = this.sourceCitations();

    this.messages.update((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', content: command, citations: [] },
      { id: crypto.randomUUID(), role: 'assistant', content: response, citations },
    ]);

    this.command.set('');
  }

  runInsight(card: AiInsightCard): void {
    this.runCommand(card.command ?? card.title);
  }

  runSuggestion(suggestion: string): void {
    this.runCommand(suggestion);
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.shiftKey) {
      return;
    }

    keyboardEvent.preventDefault();
    this.runCommand();
  }

  onAttachFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) {
      return;
    }

    const incoming = Array.from(files).map((file) => file.name);
    this.attachedFiles.update((current) => [...new Set([...current, ...incoming])]);
    input.value = '';
  }

  removeAttachment(fileName: string): void {
    this.attachedFiles.update((current) => current.filter((item) => item !== fileName));
  }

  toggleMode(): void {
    this.chatMode.update((mode) => (mode === 'Fast' ? 'Deep Reason' : 'Fast'));
  }

  setMode(mode: ChatMode): void {
    this.chatMode.set(mode);
  }

  isModeSelected(mode: ChatMode): boolean {
    return this.chatMode() === mode;
  }

  toggleSource(key: SourceToggleKey): void {
    this.sourceToggles.update((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  private getResponseFor(command: string): string {
    const commandHandlers: Array<{ keywords: string[]; response: () => string }> = [
      { keywords: ['summary', 'status', 'overview'], response: () => this.getSummaryResponse() },
      { keywords: ['next', 'priority'], response: () => this.getNextActionResponse() },
      { keywords: ['follow'], response: () => this.getFollowUpResponse() },
      { keywords: ['interview', 'prep'], response: () => this.getInterviewPrepResponse() },
      { keywords: ['offer', 'strategy'], response: () => this.getOfferStrategyResponse() },
    ];

    const match = commandHandlers.find((handler) => this.matchesAny(command, handler.keywords));
    if (match) {
      return match.response();
    }

    return this.getUnknownCommandResponse();
  }

  private matchesAny(command: string, keywords: string[]): boolean {
    return keywords.some((keyword) => command.includes(keyword));
  }

  private getSummaryResponse(): string {
    const ctx = this.context();
    return `### Pipeline Summary\n- Total applications: **${ctx.totalApplications}**\n- Active interviews: **${ctx.activePipeline}**\n- Offers: **${ctx.offers}**\n- Pending follow-ups: **${ctx.dueFollowUps}**`;
  }

  private getNextActionResponse(): string {
    const ctx = this.context();

    if (ctx.activePipeline > 0) {
      return `### Recommended Next Action\nPrepare for **${ctx.activePipeline}** active interview process${ctx.activePipeline === 1 ? '' : 'es'}.\n\n- Review role outcomes\n- Practice STAR examples\n- Prepare 2 company-specific questions`;
    }

    if (ctx.dueFollowUps > 0) {
      return `### Recommended Next Action\nSend **${ctx.dueFollowUps}** follow-up message${ctx.dueFollowUps === 1 ? '' : 's'} by end of day to re-engage active applications.`;
    }

    return '### Recommended Next Action\nSubmit 2 high-fit applications and request 1 referral to maintain pipeline momentum.';
  }

  private getFollowUpResponse(): string {
    const ctx = this.context();

    if (ctx.dueFollowUps === 0) {
      return '### Follow-ups\nNo follow-ups are overdue.\n\nSet reminders for +4 business days after each new application.';
    }

    return `### Follow-up Plan\nSend **${ctx.dueFollowUps}** concise updates.\n\n- Mention one role-fit achievement\n- Reconfirm interest\n- End with a specific scheduling ask`;
  }

  private getInterviewPrepResponse(): string {
    const ctx = this.context();

    if (ctx.activePipeline === 0) {
      return '### Interview Preparation\nNo active interviews yet.\n\nImprove conversion by tailoring resume bullets to outcomes and adding one quantified project per target role.';
    }

    return `### Interview Preparation\nBuild a 30-60-90 narrative for **${ctx.activePipeline}** active process${ctx.activePipeline === 1 ? '' : 'es'} and rehearse STAR answers focused on ownership and ambiguity.`;
  }

  private getOfferStrategyResponse(): string {
    const ctx = this.context();

    if (ctx.offers > 0) {
      return `### Offer Strategy\nYou currently have **${ctx.offers}** offer${ctx.offers === 1 ? '' : 's'}.\n\nRank options by growth, scope, and compensation, then negotiate one high-impact term.`;
    }

    const companyHint = ctx.topCompany ? ` Start with ${ctx.topCompany}.` : '';
    return `### Offer Strategy\nPrioritize applications with strongest skill match and referral access.${companyHint}`;
  }

  private getUnknownCommandResponse(): string {
    return '### I can help with this\nTry one of these prompts:\n- summary\n- next action\n- follow-ups\n- interview prep\n- offer strategy';
  }

  private applyModeToResponse(response: string): string {
    if (this.chatMode() === 'Fast') {
      const concisePart = response.split('\n\n')[0] ?? response;
      return `${concisePart}\n\n> Mode: Fast`;
    }

    return `${response}\n\n### Additional Considerations\n- Prioritize high-fit roles first\n- Keep follow-ups time-boxed\n- Track outcomes weekly\n\n> Mode: Deep Reason`;
  }

  renderMarkdown(markdown: string): string {
    // First escape to prevent XSS
    const escaped = markdown
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');

    // Then apply markdown transformations to safe HTML tags
    const withHeadings = escaped
      .replaceAll(
        /^###\s(.+)$/gm,
        '<h4 class="mb-2 mt-1 text-sm font-semibold text-foreground">$1</h4>',
      )
      .replaceAll(
        /^##\s(.+)$/gm,
        '<h3 class="mb-2 mt-2 text-base font-semibold text-foreground">$1</h3>',
      );

    const withInline = withHeadings
      .replaceAll(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
      .replaceAll(/`(.+?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-[11px]">$1</code>');

    const withLists = withInline
      .replaceAll(/^-\s(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replaceAll(
        /(<li class="ml-4 list-disc">.*?<\/li>\n?)+/gs,
        '<ul class="mb-2 space-y-1 text-xs text-muted-foreground">$&</ul>',
      );

    const html = withLists.replaceAll('\n\n', '<br><br>').replaceAll('\n', '<br>');

    // Return plain string - Angular's [innerHTML] will sanitize automatically
    return html;
  }
}
