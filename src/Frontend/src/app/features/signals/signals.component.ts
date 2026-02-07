import { ChangeDetectionStrategy, Component, effect, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProfileStore } from '../profile/services/profile.store';
import { IntelligenceService, GlobalSignal } from '../../core/services/intelligence.service';

// Icons
import { provideIcons, NgIcon } from '@ng-icons/core';
import {
    lucideGlobe,
    lucideTrendingUp,
    lucideZap,
    lucideLayers,
    lucideSearch,
    lucideRadio,
    lucideClock,
    lucideAlertCircle,
    lucideX,
    lucideExternalLink
} from '@ng-icons/lucide';

// Spartan UI Imports
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

@Component({
    selector: 'app-signals',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        NgIcon,
        ...HlmBadgeImports,
        ...HlmButtonImports,
        ...HlmSkeletonImports,
    ],
    providers: [
        provideIcons({
            lucideGlobe,
            lucideTrendingUp,
            lucideZap,
            lucideLayers,
            lucideSearch,
            lucideRadio,
            lucideClock,
            lucideAlertCircle,
            lucideX,
            lucideExternalLink
        }),
    ],
    templateUrl: './signals.component.html',
    styleUrls: ['./signals.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsComponent {
    private readonly profileStore = inject(ProfileStore);
    private readonly intelligenceService = inject(IntelligenceService);

    // Profile data
    readonly profile = this.profileStore.profile;
    readonly userSkills = this.profileStore.userSkills;

    readonly signals = signal<GlobalSignal[]>([]);
    readonly isLoading = signal<boolean>(true);
    readonly selectedFilter = signal<string>('All');

    // Overlay state
    readonly selectedItem = signal<GlobalSignal | null>(null);
    readonly displayedSummary = signal('');
    private typeInterval: ReturnType<typeof setInterval> | null = null;

    // Derived state for skills
    readonly skillChips = computed(() => {
        const skills = this.userSkills();
        return ['All', ...skills.map(s => s.name)];
    });

    readonly filteredSignals = computed(() => {
        const filter = this.selectedFilter();
        const allSignals = this.signals();

        if (filter === 'All') return allSignals;

        return allSignals.filter(s =>
            s.tags.some(t => t.toLowerCase() === filter.toLowerCase()) ||
            s.category.toLowerCase() === filter.toLowerCase()
        );
    });

    constructor() {
        // Load signals when profile is loaded or skills change
        effect(() => {
            const skills = this.userSkills().map(s => s.name);
            const jobTitle = this.profile()?.currentJobTitle || '';

            this.isLoading.set(true);
            this.intelligenceService.getGlobalSignals(skills, jobTitle).subscribe({
                next: (data) => {
                    this.signals.set(data);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Failed to fetch signals', err);
                    this.isLoading.set(false);
                }
            });
        }, { allowSignalWrites: true });
    }

    setFilter(filter: string) {
        this.selectedFilter.set(filter);
    }

    getImpactColor(score: number): string {
        if (score >= 90) return 'text-rose-500';
        if (score >= 80) return 'text-orange-500';
        return 'text-amber-500';
    }

    openIntelligenceReport(signalId: string) {
        const item = this.signals().find(s => s.id === signalId);
        if (!item) return;

        this.selectedItem.set(item);
        this.startTypewriter(item.summary || 'Deep strategic analysis in progress. Correlating market signals with your career trajectory...');
    }

    closeReport() {
        this.selectedItem.set(null);
        if (this.typeInterval) {
            clearInterval(this.typeInterval);
            this.typeInterval = null;
        }
        this.displayedSummary.set('');
    }

    private startTypewriter(text: string) {
        this.displayedSummary.set('');
        let i = 0;
        if (this.typeInterval) {
            clearInterval(this.typeInterval);
        }

        this.typeInterval = setInterval(() => {
            if (i < text.length) {
                this.displayedSummary.update(current => current + text.charAt(i));
                i++;
            } else {
                if (this.typeInterval) {
                    clearInterval(this.typeInterval);
                    this.typeInterval = null;
                }
            }
        }, 15);
    }
}
