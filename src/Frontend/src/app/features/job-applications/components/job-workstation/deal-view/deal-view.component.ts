import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

interface PlaybookScript {
    id: string;
    labelKey: string;
    scriptKey: string;
    impactKey: string;
    typeKey: string;
}

interface CompensationSegment {
    labelKey: string;
    value: number;
    colorClass: string;
    textClass: string;
}

@Component({
    selector: 'app-deal-view',
    imports: [CommonModule, NgIcon, TranslocoPipe, ...HlmButtonImports],
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
    private readonly transloco = inject(TranslocoService);

    isAnalyzing = signal(false);
    isOfferUploaded = signal(false);

    analysisResults = signal({
        salaryRatingKey: 'workstation.offer.snapshot.salaryRatingValue',
        equityComplexityKey: 'workstation.offer.snapshot.equityComplexityValue',
        redFlagKeys: [
            'workstation.offer.risks.variableBonus',
            'workstation.offer.risks.nonCompete'
        ],
        score: 88
    });

    compBreakdown = signal<CompensationSegment[]>([
        {
            labelKey: 'workstation.offer.compensation.base',
            value: 70,
            colorClass: 'bg-primary',
            textClass: 'text-primary'
        },
        {
            labelKey: 'workstation.offer.compensation.equity',
            value: 20,
            colorClass: 'bg-info',
            textClass: 'text-info'
        },
        {
            labelKey: 'workstation.offer.compensation.bonus',
            value: 10,
            colorClass: 'bg-warning',
            textClass: 'text-warning'
        }
    ]);

    playbook = signal<PlaybookScript[]>([
        {
            id: '1',
            labelKey: 'workstation.offer.playbook.valueAlignment.title',
            typeKey: 'workstation.offer.playbook.valueAlignment.type',
            scriptKey: 'workstation.offer.playbook.valueAlignment.script',
            impactKey: 'workstation.offer.playbook.valueAlignment.impact'
        },
        {
            id: '2',
            labelKey: 'workstation.offer.playbook.marketEvidence.title',
            typeKey: 'workstation.offer.playbook.marketEvidence.type',
            scriptKey: 'workstation.offer.playbook.marketEvidence.script',
            impactKey: 'workstation.offer.playbook.marketEvidence.impact'
        },
        {
            id: '3',
            labelKey: 'workstation.offer.playbook.riskClarification.title',
            typeKey: 'workstation.offer.playbook.riskClarification.type',
            scriptKey: 'workstation.offer.playbook.riskClarification.script',
            impactKey: 'workstation.offer.playbook.riskClarification.impact'
        }
    ]);

    simulateUpload() {
        this.isAnalyzing.set(true);
        setTimeout(() => {
            this.isAnalyzing.set(false);
            this.isOfferUploaded.set(true);
            this.notificationService.success(
                this.transloco.translate('workstation.offer.notifications.analyzed.body'),
                this.transloco.translate('workstation.offer.notifications.analyzed.title')
            );
        }, 2500);
    }

    generateCounterOffer() {
        this.notificationService.info(
            this.transloco.translate('workstation.offer.notifications.generating.body'),
            this.transloco.translate('workstation.offer.notifications.generating.title')
        );
        setTimeout(() => {
            this.notificationService.success(
                this.transloco.translate('workstation.offer.notifications.ready.body'),
                this.transloco.translate('workstation.offer.notifications.ready.title')
            );
        }, 1500);
    }
}
