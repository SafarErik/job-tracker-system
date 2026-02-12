import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconProvider, LUCIDE_ICONS, Sparkles } from 'lucide-angular';

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

@Component({
  selector: 'app-ai-command-widget',
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Sparkles,
      }),
    },
  ],
  templateUrl: './ai-command-widget.component.html',
  styleUrl: './ai-command-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiCommandWidgetComponent {
  title = input('Career Copilot');
  insightCards = input.required<AiInsightCard[]>();
  placeholder = input('> Type command...');
  context = input.required<AiCopilotContext>();

  readonly command = signal('');
  readonly lastResponse = signal(
    'Try “summary” or “next action” to get a tactical recommendation.',
  );
  readonly commandSuggestions = computed(() => {
    const pending = this.context().dueFollowUps;

    return pending > 0
      ? ['summary', 'next action', 'follow-ups', 'interview prep']
      : ['summary', 'next action', 'pipeline', 'offer strategy'];
  });

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
      this.lastResponse.set('Type a command first. Try “summary” or “next action”.');
      return;
    }

    this.lastResponse.set(this.getResponseFor(normalized));
    this.command.set('');
  }

  runInsight(card: AiInsightCard): void {
    this.runCommand(card.command ?? card.title);
  }

  runSuggestion(suggestion: string): void {
    this.runCommand(suggestion);
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
    return `Pipeline snapshot: ${ctx.totalApplications} total applications, ${ctx.activePipeline} active interview threads, ${ctx.offers} offers, and ${ctx.dueFollowUps} pending follow-ups.`;
  }

  private getNextActionResponse(): string {
    const ctx = this.context();

    if (ctx.activePipeline > 0) {
      return `Priority now: prepare for active interview loops (${ctx.activePipeline}). Focus on role-specific stories and 2 measurable wins per company.`;
    }

    if (ctx.dueFollowUps > 0) {
      return `Priority now: send ${ctx.dueFollowUps} follow-up message${ctx.dueFollowUps === 1 ? '' : 's'} before end of day to revive warm applications.`;
    }

    return 'Priority now: submit 2 high-fit applications and queue one referral request to keep pipeline velocity high.';
  }

  private getFollowUpResponse(): string {
    const ctx = this.context();

    if (ctx.dueFollowUps === 0) {
      return 'No overdue follow-ups detected. Keep momentum by setting reminders for every new application at +4 business days.';
    }

    return `Follow-up plan: send ${ctx.dueFollowUps} concise check-ins, include one role-fit achievement, and close with a specific scheduling ask.`;
  }

  private getInterviewPrepResponse(): string {
    const ctx = this.context();

    if (ctx.activePipeline === 0) {
      return 'No active interviews yet. Improve conversion by tailoring CV bullets to role outcomes and adding one quantified project per target role.';
    }

    return `Interview prep: build a 30-60-90 narrative for ${ctx.activePipeline} active process${ctx.activePipeline === 1 ? '' : 'es'} and rehearse STAR answers for leadership + ambiguity.`;
  }

  private getOfferStrategyResponse(): string {
    const ctx = this.context();

    if (ctx.offers > 0) {
      return `You already have ${ctx.offers} offer${ctx.offers === 1 ? '' : 's'}. Strategy: rank by growth, scope, and compensation, then negotiate one high-impact term.`;
    }

    const companyHint = ctx.topCompany ? ` Start with ${ctx.topCompany}.` : '';
    return `Offer strategy: prioritize applications with strongest skill-match and referral access.${companyHint}`;
  }

  private getUnknownCommandResponse(): string {
    return 'Command not recognized. Try: summary, next action, follow-ups, interview prep, or offer strategy.';
  }
}
