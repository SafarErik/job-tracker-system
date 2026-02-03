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
    lucideMessageSquare
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
            lucideMessageSquare
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
    }
}
