import { Component, input, output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSend, lucideHistory, lucideMicroscope } from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '../../../../../../../libs/ui/input';

@Component({
  selector: 'app-ai-analyst-chat',
  imports: [CommonModule, FormsModule, ...HlmInputImports, NgIcon],
  providers: [provideIcons({ lucideSend, lucideHistory, lucideMicroscope })],
  templateUrl: './ai-analyst-chat.html',
  styleUrls: ['./ai-analyst-chat.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AiAnalystChatComponent {
  companyName = input<string>('');
  companyContext = input<string>('');


  messages = signal([
    { role: 'analyst', content: 'Vadis Guidance is ready. I can summarize company context, identify interview angles, and connect this research to your pipeline.' }
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
        content: `Based on the current context for ${this.companyName() || 'this company'} (${context}), I recommend focusing your technical pitch on distributed systems scalability. They appear to be restructuring their infrastructure team.`
      }]);
    }, 1000);
  }
}
