import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideLock,
    lucideSparkles,
    lucideFileText,
    lucideCopy,
    lucideDownload,
    lucideHistory,
    lucideCheck,
    lucideMail,
    lucideLoader2,
    lucideChevronRight,
    lucideChevronLeft,
    lucideWand2,
    lucideInfo
} from '@ng-icons/lucide';
import { JobApplicationStore } from '../../../services/job-application.store';
import { DocumentStore } from '../../../../documents/services/document.store';
import { NotificationService } from '../../../../../core/services/notification.service';

@Component({
    selector: 'app-assets-view',
    standalone: true,
    imports: [CommonModule, NgIcon],
    providers: [
        provideIcons({
            lucideLock,
            lucideSparkles,
            lucideFileText,
            lucideCopy,
            lucideDownload,
            lucideHistory,
            lucideCheck,
            lucideMail,
            lucideLoader2,
            lucideChevronRight,
            lucideChevronLeft,
            lucideWand2,
            lucideInfo
        })
    ],
    templateUrl: './assets-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsViewComponent {
    public readonly store = inject(JobApplicationStore);
    public readonly documentStore = inject(DocumentStore);
    private readonly notificationService = inject(NotificationService);

    mode = signal<'resume' | 'cover-letter'>('resume');
    isSidebarOpen = signal(false);
    selectedSuggestion = signal<string | null>(null);

    suggestions = signal([
        { id: '1', title: 'Action-Oriented Verbs', content: 'Replace "Responsible for" with "Spearheaded" or "Architected" to show leadership.' },
        { id: '2', title: 'Metric Quantification', content: 'Add specific percentages (e.g., "Increased performance by 40%").' },
        { id: '3', title: 'Keyword Alignment', content: 'The job asks for "Distributed Systems". Explicitly mention your Kafka experience here.' }
    ]);

    setMode(m: 'resume' | 'cover-letter') {
        this.mode.set(m);
    }

    generateCoverLetter() {
        const app = this.store.selectedApplication();
        if (app) {
            this.mode.set('cover-letter');
            this.store.generateAssets(app.id);
        }
    }

    tailorResume() {
        const app = this.store.selectedApplication();
        if (app) {
            this.mode.set('resume');
            this.store.generateAssets(app.id);
        }
    }

    copyContent(text: string | null | undefined) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            this.notificationService.success('Copied to clipboard!', 'Success');
        });
    }

    downloadAsPdf(text: string | null | undefined, filename: string) {
        if (!text) return;

        // Simple text download as a placeholder for real PDF generation
        const blob = new Blob([text], { type: 'text/plain' });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        a.click();
        globalThis.URL.revokeObjectURL(url);

        this.notificationService.info('Downloading as .txt (PDF generation coming soon)', 'Download');
    }

    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }

    selectSuggestion(suggestion: any) {
        this.selectedSuggestion.set(suggestion.content);
        this.notificationService.info(`Applied: ${suggestion.title}`, 'AI Polish');
    }
}
