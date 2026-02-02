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
    lucideMail
} from '@ng-icons/lucide';
import { JobApplicationStore } from '../../../services/job-application.store';

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
            lucideMail
        })
    ],
    templateUrl: './assets-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsViewComponent {
    public readonly store = inject(JobApplicationStore);

    mode = signal<'resume' | 'cover-letter'>('resume');
    hasCoverLetter = signal(false);

    setMode(m: 'resume' | 'cover-letter') {
        this.mode.set(m);
    }

    generateCoverLetter() {
        this.hasCoverLetter.set(true);
    }
}
