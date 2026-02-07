import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileStore } from '../profile/services/profile.store';
import { IntelligenceService, GlobalSignal, CareerOpportunity } from '../../core/services/intelligence.service';
import { ApplicationService } from '../job-applications/services/application.service';
import { CreateJobApplication } from '../job-applications/models/job-application.model';
import { JobApplicationStatus } from '../job-applications/models/application-status.enum';

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
    lucideMessageSquare,
    lucideX,
    lucideSend,
    lucideBriefcase,
    lucideMapPin,
    lucideBuilding2,
    lucideExternalLink
} from '@ng-icons/lucide';

import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSkeleton } from '../../../../libs/ui/skeleton/src/lib/hlm-skeleton';

@Component({
    selector: 'app-signals',
    imports: [
        CommonModule,
        FormsModule,
        NgIcon,
        DatePipe,
        HlmButtonImports,
        HlmSkeleton
    ],
    templateUrl: './signals.component.html',
    styleUrls: ['./signals.component.css'],
    providers: [
        provideIcons({
            lucideGlobe,
            lucideTrendingUp,
            lucideZap,
            lucideLayers,
            lucideSearch,
            lucideRadio,
            lucideClock,
            lucideMessageSquare,
            lucideX,
            lucideSend,
            lucideBriefcase,
            lucideMapPin,
            lucideBuilding2,
            lucideExternalLink
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalsComponent implements OnInit, OnDestroy {
    private readonly destroyRef = inject(DestroyRef);
    private readonly profileStore = inject(ProfileStore);
    private readonly intelligenceService = inject(IntelligenceService);
    private readonly jobApplicationService = inject(ApplicationService);

    // Profile data
    readonly profile = this.profileStore.profile;
    readonly userSkills = this.profileStore.userSkills;


    readonly activeTab = signal<'intelligence' | 'careers'>('intelligence');
    readonly signals = signal<GlobalSignal[]>([]);
    readonly opportunities = signal<CareerOpportunity[]>([]);
    readonly isLoading = signal<boolean>(true);
    readonly selectedFilter = signal<string>('All');

    // Chat state
    readonly isChatOpen = signal(false);
    readonly chatMessages = signal<{ sender: 'user' | 'agent', text: string }[]>([
        { sender: 'agent', text: 'Vantage Agent initialized. Grid monitoring active. Awaiting command.' }
    ]);
    readonly isScanning = signal(false);

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

    // Lifecycle
    ngOnInit(): void {
        console.log('SignalsComponent: Initializing...');
        this.loadData();
    }

    ngOnDestroy(): void {
        if (this.typeInterval) {
            clearInterval(this.typeInterval);
            this.typeInterval = null;
        }
    }

    /**
     * Load signals and career opportunities with proper subscription cleanup
     */
    private loadData(): void {
        const skills = this.userSkills().map(s => s.name);
        const jobTitle = this.profile()?.currentJobTitle || '';

        console.log('SignalsComponent: Loading signals for', { skills, jobTitle });
        this.isLoading.set(true);

        // Load signals with cleanup
        this.intelligenceService.getGlobalSignals(skills, jobTitle)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    console.log('SignalsComponent: Signals loaded', data);
                    this.signals.set(data);
                    if (this.activeTab() === 'intelligence') this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Failed to fetch signals', err);
                    this.isLoading.set(false);
                }
            });

        // Load opportunities with cleanup  
        this.intelligenceService.getCareerOpportunities()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    console.log('SignalsComponent: Opportunities loaded', data);
                    this.opportunities.set(data);
                    if (this.activeTab() === 'careers') this.isLoading.set(false);
                },
                error: (err) => console.error('Failed to fetch opportunities', err)
            });
    }

    setActiveTab(tab: 'intelligence' | 'careers') {
        this.activeTab.set(tab);
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

    // Career Actions
    acquireTarget(opp: CareerOpportunity) {
        // Convert to Job Application
        const newApp: CreateJobApplication = {
            position: opp.roleTitle,
            companyName: opp.company,
            status: JobApplicationStatus.Applied, // or INTERESTED
            location: opp.location,
            source: opp.source,
            matchScore: opp.matchScore,
            // Map other fields as needed
            jobUrl: '', // need from opp?
            description: `Imported from Career Opportunity: ${opp.roleTitle} at ${opp.company}`
        };

        this.jobApplicationService.createApplication(newApp)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    // Show toast or feedback?
                    alert(`Target Acquired: ${opp.roleTitle}`);
                },
                error: () => alert('Failed to acquire target')
            });
    }

    // Chat Actions
    toggleChat() {
        this.isChatOpen.update(v => !v);
    }

    sendMessage(message: string) {
        if (!message.trim()) return;

        this.chatMessages.update(msgs => [...msgs, { sender: 'user', text: message }]);
        this.isScanning.set(true);

        // Mock response
        setTimeout(() => {
            this.isScanning.set(false);
            this.chatMessages.update(msgs => [...msgs, {
                sender: 'agent',
                text: `Acknowledged. Scanning global sectors for "${message}". Correlation matrix updated.`
            }]);
        }, 2000);
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
