import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
        aria-label="AI Assistant"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <div class="flex items-center gap-2.5">
            <lucide-angular name="Sparkles" class="h-5 w-5 text-primary" />
            <h2 class="text-sm font-semibold text-foreground">Career Copilot</h2>
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
                {{ mode }}
              </button>
            }
            <button
              hlmBtn
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              (click)="close()"
              aria-label="Close AI Assistant"
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
              <div [innerHTML]="renderMarkdown(msg.content)"></div>
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
            @for (prompt of quickPrompts; track prompt) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                class="h-7 text-xs"
                (click)="runCommand(prompt)"
              >
                {{ prompt }}
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
              placeholder="Ask anything..."
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
              aria-label="Send message"
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
    private readonly sanitizer = inject(DomSanitizer);

    readonly command = signal('');
    readonly chatMode = signal<ChatMode>('Fast');
    readonly availableModes: ChatMode[] = ['Fast', 'Deep Reason'];
    readonly quickPrompts = ['summary', 'next action', 'follow-ups', 'interview prep'];
    readonly hasCommand = computed(() => this.command().trim().length > 0);

    readonly messages = signal<ChatMessage[]>([
        {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '### Welcome to Career Copilot\nI can help with:\n- Pipeline summaries\n- Follow-up strategy\n- Interview preparation\n\nTry asking for a **next best action**.',
            citations: ['Dashboard Metrics'],
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
        const modeLabel = this.chatMode() === 'Fast' ? '> Mode: Fast' : '> Mode: Deep Reason';

        this.messages.update((current) => [
            ...current,
            { id: crypto.randomUUID(), role: 'user', content: cmd, citations: [] },
            { id: crypto.randomUUID(), role: 'assistant', content: `${response}\n\n${modeLabel}`, citations: ['Dashboard Metrics'] },
        ]);

        this.command.set('');
    }

    renderMarkdown(markdown: string): SafeHtml {
        const escaped = markdown
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');

        const html = escaped
            .replaceAll(/^###\s(.+)$/gm, '<h4 class="mb-2 mt-1 text-sm font-semibold text-foreground">$1</h4>')
            .replaceAll(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
            .replaceAll(/^-\s(.+)$/gm, '<li class="ml-4 list-disc text-xs text-muted-foreground">$1</li>')
            .replaceAll(/(<li.*?<\/li>\n?)+/gs, '<ul class="mb-2 space-y-1">$&</ul>')
            .replaceAll('\n\n', '<br><br>')
            .replaceAll('\n', '<br>');

        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    private getResponseFor(command: string): string {
        if (this.matchesAny(command, ['summary', 'status', 'overview'])) {
            return '### Pipeline Summary\nYour applications are being tracked. Open the dashboard for detailed metrics.';
        }
        if (this.matchesAny(command, ['next', 'priority', 'action'])) {
            return '### Recommended Next Action\nReview your active interviews and prepare STAR examples for upcoming sessions.';
        }
        if (this.matchesAny(command, ['follow'])) {
            return '### Follow-up Plan\nSend concise updates to pending applications. Mention one role-fit achievement and reconfirm interest.';
        }
        if (this.matchesAny(command, ['interview', 'prep'])) {
            return '### Interview Preparation\nBuild a 30-60-90 narrative and rehearse STAR answers focused on ownership and ambiguity.';
        }
        return '### I can help with this\nTry: summary, next action, follow-ups, or interview prep.';
    }

    private matchesAny(command: string, keywords: string[]): boolean {
        return keywords.some((k) => command.includes(k));
    }
}
