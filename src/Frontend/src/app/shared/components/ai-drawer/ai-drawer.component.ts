import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
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
    X,
} from 'lucide-angular';
import { UiStateService } from '../../../core/services';

export interface AiCopilotContext {
    totalApplications: number;
    activePipeline: number;
    offers: number;
    dueFollowUps: number;
    topCompany?: string;
}

type ChatMode = 'Fast' | 'Deep Reason';

interface QuickPrompt {
    labelKey: string;
    command: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations: string[];
}

@Component({
    selector: 'app-ai-drawer',
    imports: [
        CommonModule,
        TextFieldModule,
        LucideAngularModule,
        TranslocoPipe,
        ...HlmButtonImports,
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
                X,
            }),
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(document:keydown.escape)': 'close()',
    },
    template: `
    @if (uiService.isAiDrawerOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-89 bg-background/40 backdrop-blur-sm transition-opacity"
        (click)="close()"
        aria-hidden="true"
      ></div>

      <!-- Drawer Panel -->
      <aside
        class="drawer-panel fixed right-0 top-0 z-90 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="'ai.drawer.ariaLabel' | transloco"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <div class="flex items-center gap-2.5">
            <lucide-angular name="Sparkles" class="h-5 w-5 text-primary" />
            <h2 class="text-sm font-semibold text-foreground">{{ 'ai.drawer.title' | transloco }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <!-- Mode toggle -->
            @for (mode of availableModes; track mode) {
              <button
                hlmBtn
                size="sm"
                [variant]="chatMode() === mode ? 'default' : 'outline'"
                class="h-7 text-xs"
                (click)="setMode(mode)"
              >
                {{ mode === 'Fast' ? ('ai.drawer.modeFast' | transloco) : ('ai.drawer.modeDeep' | transloco) }}
              </button>
            }
            <button
              hlmBtn
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              (click)="close()"
              [attr.aria-label]="'ai.drawer.close' | transloco"
            >
              <lucide-angular name="X" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 overflow-y-auto p-5 space-y-4 chat-scroll">
          @for (msg of messages(); track msg.id) {
            <div
              class="rounded-xl px-4 py-3 text-sm"
              [class.bg-muted/50]="msg.role === 'assistant'"
              [class.bg-primary/10]="msg.role === 'user'"
              [class.ml-8]="msg.role === 'user'"
            >
              <p class="whitespace-pre-line leading-relaxed">{{ msg.content }}</p>
              @if (msg.citations.length > 0) {
                <div class="mt-2 flex flex-wrap gap-1.5">
                  @for (cite of msg.citations; track cite) {
                    <span class="inline-flex rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {{ cite }}
                    </span>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Prompts -->
        <div class="border-t border-border px-5 py-3">
          <div class="mb-3 flex flex-wrap gap-2">
            @for (prompt of quickPrompts; track prompt.command) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                class="h-7 text-xs"
                (click)="runCommand(prompt.command)"
              >
                {{ prompt.labelKey | transloco }}
              </button>
            }
          </div>

          <!-- Input -->
          <div class="flex items-end gap-2 rounded-xl border border-border bg-background p-2">
            <textarea
              cdkTextareaAutosize
              cdkAutosizeMinRows="1"
              cdkAutosizeMaxRows="4"
              class="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              [placeholder]="'ai.drawer.placeholder' | transloco"
              [value]="command()"
              (input)="updateCommand($event)"
              (keydown.enter)="onEnter($event)"
            ></textarea>
            <button
              hlmBtn
              size="icon"
              class="h-8 w-8 shrink-0"
              [disabled]="!hasCommand()"
              (click)="runCommand()"
              [attr.aria-label]="'ai.drawer.send' | transloco"
            >
              <lucide-angular name="ArrowUp" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    }
  `,
    styles: `
    :host { display: contents; }

    .drawer-panel {
      animation: drawer-in 0.2s ease-out;
    }

    @keyframes drawer-in {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }

    .chat-scroll {
      scrollbar-width: thin;
      scrollbar-color: hsl(var(--border)) transparent;
    }

    .chat-scroll::-webkit-scrollbar {
      width: 4px;
    }

    .chat-scroll::-webkit-scrollbar-thumb {
      background: hsl(var(--border));
      border-radius: 2px;
    }
  `,
})
export class AiDrawerComponent {
    readonly uiService = inject(UiStateService);
    private readonly transloco = inject(TranslocoService);

    readonly command = signal('');
    readonly chatMode = signal<ChatMode>('Fast');
    readonly availableModes: ChatMode[] = ['Fast', 'Deep Reason'];
    readonly quickPrompts: QuickPrompt[] = [
        { labelKey: 'ai.drawer.quickPrompts.summary', command: 'summary' },
        { labelKey: 'ai.drawer.quickPrompts.nextAction', command: 'next action' },
        { labelKey: 'ai.drawer.quickPrompts.followUps', command: 'follow-ups' },
        { labelKey: 'ai.drawer.quickPrompts.interviewPrep', command: 'interview prep' },
    ];
    readonly hasCommand = computed(() => this.command().trim().length > 0);

    readonly messages = signal<ChatMessage[]>([
        {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: this.combineResponse('ai.drawer.welcomeTitle', 'ai.drawer.welcomeBody'),
            citations: [this.transloco.translate('app.dashboard')],
        },
    ]);

    close(): void {
        this.uiService.closeAiDrawer();
    }

    setMode(mode: ChatMode): void {
        this.chatMode.set(mode);
    }

    updateCommand(event: Event): void {
        this.command.set((event.target as HTMLTextAreaElement).value);
    }

    onEnter(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.shiftKey) return;
        keyboardEvent.preventDefault();
        this.runCommand();
    }

    runCommand(rawCommand?: string): void {
        const cmd = (rawCommand ?? this.command()).trim();
        if (!cmd) return;

        const response = this.getResponseFor(cmd.toLowerCase());
        const modeLabel = this.chatMode() === 'Fast'
            ? this.transloco.translate('ai.drawer.responses.modeFast')
            : this.transloco.translate('ai.drawer.responses.modeDeep');

        this.messages.update((current) => [
            ...current,
            { id: crypto.randomUUID(), role: 'user', content: this.getPromptLabel(cmd), citations: [] },
            { id: crypto.randomUUID(), role: 'assistant', content: `${response}\n\n${modeLabel}`, citations: [this.transloco.translate('app.dashboard')] },
        ]);

        this.command.set('');
    }

    private getResponseFor(command: string): string {
        if (this.matchesAny(command, ['summary', 'status', 'overview'])) {
            return this.combineResponse('ai.drawer.responses.summaryTitle', 'ai.drawer.responses.summaryBody');
        }
        if (this.matchesAny(command, ['next', 'priority', 'action'])) {
            return this.combineResponse('ai.drawer.responses.nextTitle', 'ai.drawer.responses.nextBody');
        }
        if (this.matchesAny(command, ['follow'])) {
            return this.combineResponse('ai.drawer.responses.followTitle', 'ai.drawer.responses.followBody');
        }
        if (this.matchesAny(command, ['interview', 'prep'])) {
            return this.combineResponse('ai.drawer.responses.interviewTitle', 'ai.drawer.responses.interviewBody');
        }
        return this.combineResponse('ai.drawer.responses.fallbackTitle', 'ai.drawer.responses.fallbackBody');
    }

    private combineResponse(titleKey: string, bodyKey: string): string {
        return `${this.transloco.translate(titleKey)}\n${this.transloco.translate(bodyKey)}`;
    }

    private getPromptLabel(command: string): string {
        const prompt = this.quickPrompts.find((item) => item.command === command);
        return prompt ? this.transloco.translate(prompt.labelKey) : command;
    }

    private matchesAny(command: string, keywords: string[]): boolean {
        return keywords.some((k) => command.includes(k));
    }
}
