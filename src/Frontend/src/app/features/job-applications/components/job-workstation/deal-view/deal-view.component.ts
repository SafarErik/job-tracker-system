import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideUploadCloud,
    lucideFileCheck,
    lucideAlertTriangle,
    lucideTrendingUp,
    lucideGavel,
    lucideMessageSquareText,
    lucideMail,
    lucideShieldCheck,
    lucideInfo,
    lucideLoader2,
    lucideSparkles
} from '@ng-icons/lucide';
import { NotificationService } from '../../../../../core/services/notification.service';
import { HlmButtonImports } from '@spartan-ng/helm/button';

interface PlaybookScript {
    id: string;
    type: 'aggressive' | 'collaborative' | 'defensive';
    label: string;
    script: string;
    impact: string;
}

@Component({
    selector: 'app-deal-view',
    standalone: true,
    imports: [CommonModule, NgIcon, ...HlmButtonImports],
    providers: [
        provideIcons({
            lucideUploadCloud,
            lucideFileCheck,
            lucideAlertTriangle,
            lucideTrendingUp,
            lucideGavel,
            lucideMessageSquareText,
            lucideMail,
            lucideShieldCheck,
            lucideInfo,
            lucideLoader2,
            lucideSparkles
        })
    ],
    templateUrl: './deal-view.component.html',
    styleUrls: ['./deal-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DealViewComponent {
    private readonly notificationService = inject(NotificationService);

    isAnalyzing = signal(false);
    isOfferUploaded = signal(false);

    analysisResults = signal({
        salaryRating: 'Above Average',
        equityComplexity: 'High (4-year vest)',
        redFlags: ['Variable bonus not guaranteed', 'Non-compete clause'],
        score: 88
    });

    compBreakdown = signal([
        { label: 'Base', value: 70, color: '#10b981' }, // Emerald-500
        { label: 'Equity', value: 20, color: '#3b82f6' }, // Blue-500
        { label: 'Bonus', value: 10, color: '#f59e0b' }  // Amber-500
    ]);

    playbook = signal<PlaybookScript[]>([
        {
            id: '1',
            type: 'collaborative',
            label: 'The Value Alignment',
            script: "I'm very excited about the mission. Based on my impact at [Previous], I'd like to discuss aligning the base with the top percentile...",
            impact: 'Best for: High Match/Strong Culture'
        },
        {
            id: '2',
            type: 'aggressive',
            label: 'The Market Multiplier',
            script: "Currently, several offers are at [X]. Given my specialized skills in [Tech], a base adjustment of 15% would make this an immediate yes...",
            impact: 'Best for: Multiple Offers/High Demand'
        }
    ]);

    simulateUpload() {
        this.isAnalyzing.set(true);
        setTimeout(() => {
            this.isAnalyzing.set(false);
            this.isOfferUploaded.set(true);
            this.notificationService.success('Offer Letter Analyzed!', 'AI Scan');
        }, 2500);
    }

    generateCounterOffer() {
        this.notificationService.info('Generating high-stakes counter-offer email...', 'AI Strategy');
        setTimeout(() => {
            this.notificationService.success('Counter-offer ready in clipboard!', 'Success');
        }, 1500);
    }
}
