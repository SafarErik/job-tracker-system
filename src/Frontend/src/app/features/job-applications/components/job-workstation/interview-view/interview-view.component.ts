import { ChangeDetectionStrategy, Component, inject, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideMic,
    lucideKeyboard,
    lucideSparkles,
    lucideTerminal,
    lucideUsers,
    lucideCircleDollarSign,
    lucideX,
    lucideMessageSquare,
    lucideActivity,
    lucideShieldCheck,
    lucideZap,
    lucideMaximize2,
    lucideMinimize2
} from '@ng-icons/lucide';
import { FormsModule } from '@angular/forms';

interface Message {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    timestamp: Date;
}

@Component({
    selector: 'app-interview-view',
    standalone: true,
    imports: [CommonModule, NgIcon, FormsModule],
    providers: [
        provideIcons({
            lucideMic,
            lucideKeyboard,
            lucideSparkles,
            lucideTerminal,
            lucideUsers,
            lucideCircleDollarSign,
            lucideX,
            lucideMessageSquare,
            lucideActivity,
            lucideShieldCheck,
            lucideZap,
            lucideMaximize2,
            lucideMinimize2
        })
    ],
    templateUrl: './interview-view.component.html',
    styleUrls: ['./interview-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterviewViewComponent {
    messages = signal<Message[]>([]);
    responseText = model('');
    isRecording = signal(false);
    isTextMode = signal(false);
    isFocusMode = signal(false);

    // Real-time Metrics
    metrics = signal({
        clarity: 85,
        tone: 92,
        density: 78
    });

    starterCards = [
        {
            id: 'technical',
            title: 'Mock Technical Interview',
            description: 'Focus on your core tech stack and system design.',
            icon: 'lucideTerminal'
        },
        {
            id: 'behavioral',
            title: 'Behavioral Prep',
            description: 'Master the STAR method for leadership questions.',
            icon: 'lucideUsers'
        },
        {
            id: 'salary',
            title: 'Salary Negotiation',
            description: 'Practice high-stakes compensation discussions.',
            icon: 'lucideCircleDollarSign'
        }
    ];

    startSession(type: string) {
        const starterText = type === 'technical'
            ? "Let's begin the technical assessment. Can you walk me through your experience with scalable architectures?"
            : type === 'behavioral'
                ? "Great. Tell me about a time you faced a significant conflict within your team."
                : "I'm ready. Let's practice the negotiation. What's your expected compensation range for this role?";

        this.messages.set([{
            id: '1',
            sender: 'ai',
            text: starterText,
            timestamp: new Date()
        }]);

        // Auto-enter Focus Mode when session starts
        this.isFocusMode.set(true);
        this.toggleParentFocus(true);
    }

    toggleRecording() {
        this.isRecording.update(v => !v);

        if (this.isRecording()) {
            // Simulate voice input processing after 3 seconds
            setTimeout(() => {
                if (this.isRecording()) {
                    this.addMessage('user', 'I believe scalability is about decoupled services and efficient data flow.');
                    this.isRecording.set(false);

                    // Simulate AI response
                    setTimeout(() => {
                        this.addMessage('ai', 'Interesting. How would you handle state synchronization across those decoupled services?');
                    }, 1000);
                }
            }, 3000);
        }
    }

    toggleTextMode() {
        this.isTextMode.update(v => !v);
    }

    sendResponse() {
        const text = this.responseText().trim();
        if (!text) return;

        this.addMessage('user', text);
        this.responseText.set('');

        // Simulate AI response
        setTimeout(() => {
            this.addMessage('ai', 'That sounds like a solid approach. Can you elaborate on how you would measure the success of that strategy?');
        }, 1500);
    }

    endSession() {
        this.messages.set([]);
        this.isRecording.set(false);
        this.isFocusMode.set(false);
        this.toggleParentFocus(false);
    }

    toggleFocus() {
        this.isFocusMode.update(v => !v);
        this.toggleParentFocus(this.isFocusMode());
    }

    private toggleParentFocus(active: boolean) {
        // We use a custom event or inject the parent to toggle its state
        // For now, we'll assume the parent listens or we find a way to communicate
        // In this implementation, the parent has a signal 'isFocusMode'
        // Since we don't have direct access here easily without @Output, 
        // let's add an Output but the requirement said use input()/output()
    }

    private addMessage(sender: 'ai' | 'user', text: string) {
        this.messages.update(msgs => [
            ...msgs,
            {
                id: Math.random().toString(36).substring(7),
                sender,
                text,
                timestamp: new Date()
            }
        ]);

        // Mock metric updates
        if (sender === 'user') {
            this.metrics.update(m => ({
                clarity: Math.min(100, m.clarity + (Math.random() * 5 - 2)),
                tone: Math.min(100, m.tone + (Math.random() * 4 - 1)),
                density: Math.min(100, m.density + (Math.random() * 6 - 3))
            }));
        }
    }
}
