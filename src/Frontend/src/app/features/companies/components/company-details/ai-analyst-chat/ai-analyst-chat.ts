import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSend, lucideHistory, lucideMicroscope, lucideBot } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '../../../../../../../libs/ui/input';

@Component({
  selector: 'app-ai-analyst-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ...HlmInputImports, NgIcon],
  providers: [provideIcons({ lucideSend, lucideHistory, lucideMicroscope, lucideBot })],
  template: `
    <div class="flex flex-col h-full bg-muted/20 font-mono">
      <!-- Chat Messages -->
      <div class="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
        @for (msg of messages(); track $index) {
          <div class="flex gap-4" [class.flex-row-reverse]="msg.role === 'user'">
            <div class="h-8 w-8 rounded-lg border border-border flex items-center justify-center shrink-0"
              [class.bg-primary/10]="msg.role === 'analyst'"
              [class.text-primary]="msg.role === 'analyst'"
              [class.bg-muted]="msg.role === 'user'"
              [class.text-muted-foreground]="msg.role === 'user'">
              <ng-icon [name]="msg.role === 'analyst' ? 'lucideBot' : 'lucideHistory'" class="h-4 w-4"></ng-icon>
            </div>
            <div class="max-w-[80%] space-y-1">
              <p class="text-[9px] font-black uppercase tracking-widest text-muted-foreground" [class.text-right]="msg.role === 'user'">
                {{ msg.role === 'analyst' ? 'AI Analyst' : 'User' }}
              </p>
              <div class="p-4 rounded-2xl border text-xs leading-relaxed"
                [class.bg-muted/50]="msg.role === 'analyst'"
                [class.border-border]="msg.role === 'analyst'"
                [class.bg-primary]="msg.role === 'user'"
                [class.border-primary]="msg.role === 'user'"
                [class.text-primary-foreground]="msg.role === 'user'">
                {{ msg.content }}
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-6 border-t border-border bg-muted/30">
        <div class="relative">
          <input hlmInput [ngModel]="currentInput()" (ngModelChange)="currentInput.set($event)" (keyup.enter)="sendMessage()"
            placeholder="Ask anything about this asset..."
            class="w-full pl-6 pr-14 py-6 bg-background border-border rounded-2xl text-xs placeholder:text-muted-foreground transition-all focus:ring-1 focus:ring-primary/30" />
          <button (click)="sendMessage()"
            class="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95">
            <ng-icon name="lucideSend" class="h-4 w-4"></ng-icon>
          </button>
        </div>
        <div class="mt-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
           <span class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-success"></div> Real-time Grid</span>
           <span class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-primary"></div> Gemini 2.0 High-Pulse</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.2); border-radius: 999px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiAnalystChatComponent {
  companyName = input<string>('');
  companyContext = input<string>('');


  messages = signal([
    { role: 'analyst', content: 'Intelligence link established. I have analyzed the current market position and technical stack. How can I assist with your strategy?' }
  ]);

  currentInput = signal('');

  sendMessage(): void {
    const inputVal = this.currentInput().trim();
    if (!inputVal) return;

    const userMsg = inputVal;
    this.messages.update(m => [...m, { role: 'user', content: userMsg }]);
    this.currentInput.set('');

    // Mock response
    setTimeout(() => {
      const context = this.companyContext() ? `Context: ${this.companyContext().slice(0, 50)}... ` : '';
      this.messages.update(m => [...m, {
        role: 'analyst',
        content: `Based on my latest scans of ${this.companyName() || 'this asset'} (${context}), I recommend focusing your technical pitch on distributed systems scalability. They are currently restructuring their infrastructure team.`
      }]);
    }, 1000);
  }
}
