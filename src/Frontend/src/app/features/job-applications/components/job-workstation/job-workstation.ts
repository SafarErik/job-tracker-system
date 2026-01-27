import {
    Component,
    OnInit,
    signal,
    computed,
    ChangeDetectionStrategy,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ApplicationService } from '../../services/application.service';
import { DocumentService } from '../../../documents/services/document.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import {
    AiAnalysisResult,
    InterviewQuestion,
    TimelineEvent,
    ResumeEnhancement,
    CoverLetterDraft,
} from '../../models/ai-analysis.model';
import { Document } from '../../../documents/models/document.model';

// Spartan UI
import { HlmLabelImports } from '@spartan-ng/helm/label';

type WorkstationTab = 'overview' | 'context' | 'coach' | 'documents' | 'interview' | 'strategy';

@Component({
    selector: 'app-job-workstation',
    imports: [CommonModule, FormsModule, ...HlmLabelImports],
    templateUrl: './job-workstation.html',
    styleUrl: './job-workstation.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobWorkstationComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly applicationService = inject(ApplicationService);
    private readonly documentService = inject(DocumentService);
    private readonly notificationService = inject(NotificationService);

    // Core state
    application = signal<JobApplication | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);

    // Tab state
    activeTab = signal<WorkstationTab>('overview');
    tabs: { id: WorkstationTab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'context', label: 'Job Context', icon: '📄' },
        { id: 'coach', label: 'AI Career Coach', icon: '🤖' },
        { id: 'documents', label: 'Documents Studio', icon: '📁' },
        { id: 'interview', label: 'Interview Prep', icon: '🎤' },
        { id: 'strategy', label: 'Strategy', icon: '🎯' },
    ];

    // Status management
    statusOptions = [
        { value: JobApplicationStatus.Applied, label: 'Applied' },
        { value: JobApplicationStatus.PhoneScreen, label: 'Phone Screen' },
        { value: JobApplicationStatus.TechnicalTask, label: 'Technical Task' },
        { value: JobApplicationStatus.Interviewing, label: 'Interviewing' },
        { value: JobApplicationStatus.Offer, label: 'Offer' },
        { value: JobApplicationStatus.Rejected, label: 'Rejected' },
        { value: JobApplicationStatus.Ghosted, label: 'Ghosted' },
    ];
    isStatusDropdownOpen = signal(false);

    // Job Context tab
    jobDescriptionInput = signal('');
    isAnalyzing = signal(false);

    // AI Coach tab
    aiAnalysis = signal<AiAnalysisResult | null>(null);

    // Documents tab
    documents = signal<Document[]>([]);
    selectedResumeId = signal<string | null>(null);
    coverLetter = signal<CoverLetterDraft>({ content: '', isEdited: false });
    isGeneratingCoverLetter = signal(false);

    // Interview Prep tab
    interviewQuestions = signal<InterviewQuestion[]>([]);
    isGeneratingQuestions = signal(false);
    expandedQuestionId = signal<string | null>(null);

    // Timeline
    timeline = signal<TimelineEvent[]>([]);

    // Mobile menu
    isMobileMenuOpen = signal(false);

    // Strategy tab
    targetSalary = signal<number | null>(null);
    actualOffer = signal<number | null>(null);
    equityBonus = signal('');
    greenFlags = signal<string[]>([]);
    redFlags = signal<string[]>([]);
    strategyNotes = signal('');
    newGreenFlag = signal('');
    newRedFlag = signal('');

    // Computed values
    matchScoreColor = computed(() => {
        const score = this.application()?.matchScore ?? 0;
        if (score >= 80) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-slate-400';
    });

    matchScoreBg = computed(() => {
        const score = this.application()?.matchScore ?? 0;
        if (score >= 80) return 'bg-green-500/20';
        if (score >= 50) return 'bg-yellow-500/20';
        return 'bg-slate-500/20';
    });

    // Helper computed for active tab display (no arrow functions in templates)
    activeTabIcon = computed(() => {
        const tab = this.tabs.find((t) => t.id === this.activeTab());
        return tab?.icon ?? '';
    });

    activeTabLabel = computed(() => {
        const tab = this.tabs.find((t) => t.id === this.activeTab());
        return tab?.label ?? '';
    });

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            const parsedId = Number.parseInt(id, 10);
            if (!isNaN(parsedId)) {
                this.loadApplication(parsedId);
                this.loadDocuments();
            } else {
                this.error.set('Invalid application ID');
                this.isLoading.set(false);
            }
        } else {
            this.isLoading.set(false);
        }
    }

    private loadApplication(id: number): void {
        this.isLoading.set(true);
        this.applicationService.getApplicationById(id).subscribe({
            next: (app) => {
                // Add mock matchScore for demo
                const enrichedApp = { ...app, matchScore: Math.floor(Math.random() * 40) + 60 };
                this.application.set(enrichedApp);
                this.jobDescriptionInput.set(app.jobDescription || '');
                this.generateMockTimeline(app);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading application:', err);
                this.error.set('Failed to load application');
                this.isLoading.set(false);
            },
        });
    }

    private loadDocuments(): void {
        this.documentService.getAllDocuments().subscribe({
            next: (docs: Document[]) => this.documents.set(docs),
            error: (err: unknown) => console.error('Error loading documents:', err),
        });
    }

    private generateMockTimeline(app: JobApplication): void {
        const events: TimelineEvent[] = [
            {
                id: '1',
                type: 'created',
                title: 'Application Created',
                timestamp: new Date(app.appliedAt),
            },
            {
                id: '2',
                type: 'applied',
                title: 'Applied to Position',
                description: `Applied for ${app.position} at ${app.companyName}`,
                timestamp: new Date(app.appliedAt),
            },
        ];
        this.timeline.set(events);
    }

    // Tab navigation
    setActiveTab(tab: WorkstationTab): void {
        this.activeTab.set(tab);
        this.isMobileMenuOpen.set(false);
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update((v) => !v);
    }

    // Status management
    toggleStatusDropdown(): void {
        this.isStatusDropdownOpen.update((v) => !v);
    }

    selectStatus(status: JobApplicationStatus): void {
        const app = this.application();
        if (!app) return;

        this.applicationService.updateApplication(app.id, { ...app, status }).subscribe({
            next: () => {
                this.application.set({ ...app, status });
                this.isStatusDropdownOpen.set(false);
                this.notificationService.success('Status updated', 'Success');
            },
            error: () => this.notificationService.error('Failed to update status', 'Error'),
        });
    }

    getStatusLabel(status: JobApplicationStatus): string {
        return this.statusOptions.find((o) => o.value === status)?.label || 'Unknown';
    }

    getStatusClass(status: JobApplicationStatus): string {
        const classes: Record<number, string> = {
            [JobApplicationStatus.Applied]: 'bg-blue-500/20 text-blue-400',
            [JobApplicationStatus.PhoneScreen]: 'bg-purple-500/20 text-purple-400',
            [JobApplicationStatus.TechnicalTask]: 'bg-orange-500/20 text-orange-400',
            [JobApplicationStatus.Interviewing]: 'bg-cyan-500/20 text-cyan-400',
            [JobApplicationStatus.Offer]: 'bg-green-500/20 text-green-400',
            [JobApplicationStatus.Rejected]: 'bg-red-500/20 text-red-400',
            [JobApplicationStatus.Ghosted]: 'bg-slate-500/20 text-slate-400',
        };
        return classes[status] || 'bg-slate-500/20 text-slate-400';
    }

    // Job Context - AI Analysis
    async analyzeJobDescription(): Promise<void> {
        const description = this.jobDescriptionInput();
        if (!description.trim()) {
            this.notificationService.error('Please enter a job description', 'Error');
            return;
        }

        this.isAnalyzing.set(true);

        // Simulate AI analysis
        await this.delay(2000);

        const mockAnalysis: AiAnalysisResult = {
            matchScore: Math.floor(Math.random() * 30) + 70,
            gapAnalysis: `Based on the job description, you have a strong match for this ${this.application()?.position} role. Your experience with web development and API design aligns well with the requirements. However, there are a few areas where you could strengthen your application.`,
            missingSkills: ['Kubernetes', 'GraphQL', 'AWS Lambda'],
            matchedSkills: ['TypeScript', 'Angular', 'RESTful APIs', 'Agile', 'Git'],
            resumeEnhancements: [
                {
                    id: '1',
                    originalBullet: 'Developed web applications using Angular',
                    rebrandedBullet: 'Architected and delivered 5+ enterprise Angular applications serving 10,000+ daily active users, reducing page load times by 40%',
                    reasoning: 'Quantify impact and scope to demonstrate scale of experience',
                    category: 'experience',
                },
                {
                    id: '2',
                    originalBullet: 'Worked on API development',
                    rebrandedBullet: 'Designed and implemented RESTful APIs processing 1M+ requests/day with 99.9% uptime, improving data retrieval speed by 60%',
                    reasoning: 'Add metrics and reliability indicators that hiring managers value',
                    category: 'experience',
                },
            ],
            generatedAt: new Date(),
        };

        this.aiAnalysis.set(mockAnalysis);
        this.application.update((app) => (app ? { ...app, matchScore: mockAnalysis.matchScore } : null));

        // Add to timeline
        this.timeline.update((events) => [
            ...events,
            {
                id: String(events.length + 1),
                type: 'ai_analysis',
                title: 'AI Analysis Completed',
                description: `Match score: ${mockAnalysis.matchScore}%`,
                timestamp: new Date(),
            },
        ]);

        this.isAnalyzing.set(false);
        this.notificationService.success('Analysis complete!', 'AI Coach');
    }

    // Cover Letter Generation
    async generateCoverLetter(): Promise<void> {
        const app = this.application();
        if (!app) return;

        this.isGeneratingCoverLetter.set(true);

        await this.delay(2500);

        const letter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${app.position} position at ${app.companyName}. Having followed your company's innovative work, I am confident that my skills and experience make me an excellent candidate for this role.

In my current role, I have successfully delivered multiple high-impact projects that directly align with your requirements. I have demonstrated expertise in building scalable applications and collaborating with cross-functional teams to achieve business objectives.

What excites me most about this opportunity is the chance to contribute to ${app.companyName}'s mission while continuing to grow as a professional. I am particularly drawn to the innovative culture and the opportunity to work on challenging problems.

I would welcome the opportunity to discuss how my background and skills align with your team's needs. Thank you for considering my application.

Best regards,
[Your Name]`;

        this.coverLetter.set({
            content: letter,
            generatedAt: new Date(),
            isEdited: false,
        });

        this.isGeneratingCoverLetter.set(false);
    }

    updateCoverLetter(content: string): void {
        this.coverLetter.update((cl) => ({ ...cl, content, isEdited: true }));
    }

    saveCoverLetterAsPdf(): void {
        this.notificationService.info('PDF generation coming soon!', 'Feature Preview');
    }

    // Interview Prep
    async generateInterviewQuestions(): Promise<void> {
        this.isGeneratingQuestions.set(true);

        await this.delay(2000);

        const questions: InterviewQuestion[] = [
            {
                id: '1',
                question: 'Tell me about a challenging project you worked on and how you overcame obstacles.',
                category: 'behavioral',
                difficulty: 'medium',
                draftAnswer: '',
                tips: 'Use the STAR method: Situation, Task, Action, Result',
            },
            {
                id: '2',
                question: 'How do you approach debugging a complex issue in a production system?',
                category: 'technical',
                difficulty: 'hard',
                draftAnswer: '',
                tips: 'Walk through your systematic approach and mention specific tools',
            },
            {
                id: '3',
                question: 'Describe a time when you had to work with a difficult team member.',
                category: 'behavioral',
                difficulty: 'medium',
                draftAnswer: '',
                tips: 'Focus on resolution and what you learned',
            },
            {
                id: '4',
                question: 'What interests you most about our company and this role?',
                category: 'company',
                difficulty: 'easy',
                draftAnswer: '',
                tips: 'Research the company beforehand and be specific',
            },
        ];

        this.interviewQuestions.set(questions);
        this.isGeneratingQuestions.set(false);
    }

    toggleQuestion(id: string): void {
        this.expandedQuestionId.update((current) => (current === id ? null : id));
    }

    updateAnswer(questionId: string, answer: string): void {
        this.interviewQuestions.update((questions) =>
            questions.map((q) => (q.id === questionId ? { ...q, draftAnswer: answer } : q)),
        );
    }

    // Utility
    copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text)
            .then(() => {
                this.notificationService.success('Copied to clipboard!', 'Success');
            })
            .catch((err) => {
                console.error('Clipboard error:', err);
                this.notificationService.error('Failed to copy to clipboard', 'Error');
            });
    }

    formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    goBack(): void {
        this.router.navigate(['/applications']);
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Strategy tab methods
    addGreenFlag(): void {
        const flag = this.newGreenFlag().trim();
        if (flag) {
            this.greenFlags.update((flags) => [...flags, flag]);
            this.newGreenFlag.set('');
        }
    }

    removeGreenFlag(index: number): void {
        this.greenFlags.update((flags) => flags.filter((_, i) => i !== index));
    }

    addRedFlag(): void {
        const flag = this.newRedFlag().trim();
        if (flag) {
            this.redFlags.update((flags) => [...flags, flag]);
            this.newRedFlag.set('');
        }
    }

    removeRedFlag(index: number): void {
        this.redFlags.update((flags) => flags.filter((_, i) => i !== index));
    }

    // Computed: Is offer below target?
    isOfferBelowTarget(): boolean {
        const target = this.targetSalary();
        const offer = this.actualOffer();
        return offer !== null && offer > 0 && target !== null && offer < target;
    }
}
