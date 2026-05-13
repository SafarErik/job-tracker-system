import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMic,
  lucideKeyboard,
  lucideTerminal,
  lucideUsers,
  lucideCircleDollarSign,
  lucideX,
  lucideMessageSquare,
  lucideActivity,
  lucideShieldCheck,
  lucideMaximize2,
  lucideMinimize2,
  lucideSend,
} from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';
import { AptelionSectionHeaderComponent } from '../../../../../shared/components/aptelion-section-header/aptelion-section-header.component';

export interface InterviewSessionMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
  scenarioId: string;
}

export interface InterviewScenario {
  id: 'technical' | 'behavioral' | 'salary';
  titleKey: string;
  descriptionKey: string;
  icon: string;
  openingPromptKey: string;
  nextPromptKey: string;
}

@Component({
  selector: 'app-interview-view',
  imports: [CommonModule, TranslocoPipe, NgIcon, FormsModule, AptelionSectionHeaderComponent],
  providers: [
    provideIcons({
      lucideMic,
      lucideKeyboard,
      lucideTerminal,
      lucideUsers,
      lucideCircleDollarSign,
      lucideX,
      lucideMessageSquare,
      lucideActivity,
      lucideShieldCheck,
      lucideMaximize2,
      lucideMinimize2,
      lucideSend,
    }),
  ],
  templateUrl: './interview-view.component.html',
  styleUrls: ['./interview-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewViewComponent implements OnDestroy {
  private readonly transloco = inject(TranslocoService);

  focusModeChange = output<boolean>();

  messages = signal<InterviewSessionMessage[]>([]);
  currentScenarioId = signal<InterviewScenario['id'] | null>(null);
  responseText = model('');
  isRecording = signal(false);
  isTextMode = signal(false);
  isFocusMode = signal(false);

  // Real-time Metrics
  metrics = signal({
    clarity: 85,
    tone: 92,
    density: 78,
  });

  readonly scenarios: InterviewScenario[] = [
    {
      id: 'technical',
      titleKey: 'workstation.interview.scenarios.technical.title',
      descriptionKey: 'workstation.interview.scenarios.technical.description',
      icon: 'lucideTerminal',
      openingPromptKey: 'workstation.interview.scenarios.technical.opening',
      nextPromptKey: 'workstation.interview.scenarios.technical.next',
    },
    {
      id: 'behavioral',
      titleKey: 'workstation.interview.scenarios.behavioral.title',
      descriptionKey: 'workstation.interview.scenarios.behavioral.description',
      icon: 'lucideUsers',
      openingPromptKey: 'workstation.interview.scenarios.behavioral.opening',
      nextPromptKey: 'workstation.interview.scenarios.behavioral.next',
    },
    {
      id: 'salary',
      titleKey: 'workstation.interview.scenarios.salary.title',
      descriptionKey: 'workstation.interview.scenarios.salary.description',
      icon: 'lucideCircleDollarSign',
      openingPromptKey: 'workstation.interview.scenarios.salary.opening',
      nextPromptKey: 'workstation.interview.scenarios.salary.next',
    },
  ];

  readonly currentScenario = computed(() =>
    this.scenarios.find((scenario) => scenario.id === this.currentScenarioId()) ?? null,
  );

  readonly currentScenarioTitleKey = computed(
    () => this.currentScenario()?.titleKey ?? 'workstation.interview.readyTitle',
  );

  readonly currentScenarioNextPromptKey = computed(
    () => this.currentScenario()?.nextPromptKey ?? 'workstation.interview.session.nextEmpty',
  );

  readonly lastPrompt = computed(() => {
    const lastAiMessage = [...this.messages()].reverse().find((message) => message.sender === 'ai');
    return lastAiMessage?.text ?? this.transloco.translate('workstation.interview.session.noPrompt');
  });

  startSession(type: InterviewScenario['id']) {
    const scenario = this.scenarios.find((item) => item.id === type);
    if (!scenario) return;

    this.currentScenarioId.set(scenario.id);
    this.messages.set([
      {
        id: crypto.randomUUID(),
        sender: 'ai',
        text: this.transloco.translate(scenario.openingPromptKey),
        timestamp: new Date(),
        scenarioId: scenario.id,
      },
    ]);
  }

  // Store timeout IDs for cleanup
  private pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

  toggleRecording() {
    this.isRecording.update((v) => !v);

    if (this.isRecording()) {
      // Clear any existing timeouts from previous recording
      this.pendingTimeouts.forEach((t) => clearTimeout(t));
      this.pendingTimeouts = [];

      // Simulate voice input processing after 3 seconds
      const timeout1 = setTimeout(() => {
        if (this.isRecording()) {
          this.addMessage(
            'user',
            this.transloco.translate('workstation.interview.mock.voiceAnswer'),
          );
          this.isRecording.set(false);

          // Simulate Vadis response.
          const timeout2 = setTimeout(() => {
            this.addMessage(
              'ai',
              this.transloco.translate('workstation.interview.mock.followUp'),
            );
          }, 1000);
          this.pendingTimeouts.push(timeout2);
        }
      }, 3000);
      this.pendingTimeouts.push(timeout1);
    }
  }

  toggleTextMode() {
    this.isTextMode.update((v) => !v);
  }

  sendResponse() {
    const text = this.responseText().trim();
    if (!text) return;

    this.addMessage('user', text);
    this.responseText.set('');

    // Clear any existing Vadis response timeouts.
    this.pendingTimeouts.forEach((t) => clearTimeout(t));

    // Simulate Vadis response.
    const timeout = setTimeout(() => {
      this.addMessage(
        'ai',
        this.currentScenario()
          ? this.transloco.translate(this.currentScenario()!.nextPromptKey)
          : this.transloco.translate('workstation.interview.mock.followUp'),
      );
    }, 1500);
    this.pendingTimeouts.push(timeout);
  }

  endSession() {
    // Clear all pending timeouts
    this.pendingTimeouts.forEach((t) => clearTimeout(t));
    this.pendingTimeouts = [];

    this.messages.set([]);
    this.currentScenarioId.set(null);
    this.isRecording.set(false);
    this.isFocusMode.set(false);
    this.toggleParentFocus(false);
  }

  toggleFocus() {
    this.isFocusMode.update((v) => !v);
    this.toggleParentFocus(this.isFocusMode());
  }

  private toggleParentFocus(active: boolean) {
    this.focusModeChange.emit(active);
  }

  ngOnDestroy(): void {
    this.pendingTimeouts.forEach((timeout) => clearTimeout(timeout));
  }

  private addMessage(sender: 'ai' | 'user', text: string) {
    const scenarioId = this.currentScenarioId() ?? 'technical';
    this.messages.update((msgs) => [
      ...msgs,
      {
        id: crypto.randomUUID(),
        sender,
        text,
        timestamp: new Date(),
        scenarioId,
      },
    ]);

    // Mock local metric updates.
    if (sender === 'user') {
      this.metrics.update((m) => ({
        clarity: Math.max(0, Math.min(100, m.clarity + (Math.random() * 5 - 2))),
        tone: Math.max(0, Math.min(100, m.tone + (Math.random() * 4 - 1))),
        density: Math.max(0, Math.min(100, m.density + (Math.random() * 6 - 3))),
      }));
    }
  }
}
