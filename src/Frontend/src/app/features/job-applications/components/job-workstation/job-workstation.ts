import {
    Component,
    OnInit,
    signal,
    computed,
    ChangeDetectionStrategy,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApplicationService } from '../../services/application.service';
import { DocumentService } from '../../../documents/services/document.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BreadcrumbService } from '../../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../companies/services/company.service';
import { JobApplication } from '../../models/job-application.model';
import { JobApplicationStatus } from '../../models/application-status.enum';
import { JobType } from '../../models/job-type.enum';
import { WorkplaceType } from '../../models/workplace-type.enum';
import { JobPriority } from '../../models/job-priority.enum';
import {
    AiAnalysisResult,
    InterviewQuestion,
    TimelineEvent,
    ResumeEnhancement,
    CoverLetterDraft,
} from '../../models/ai-analysis.model';
import { Document } from '../../../../core/models/document.model';
import { CompanyContact } from '../../../../core/models/company-contact.model';

// Spartan UI
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputImports } from '@spartan-ng/helm/input';

// Icons
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
    lucideLayoutDashboard,
    lucideFileSearch,
    lucideSparkles,
    lucideFolderKanban,
    lucideMic2,
    lucideSwords,
    lucideCalendar,
    lucideMapPin,
    lucideChevronRight,
    lucideExternalLink,
    lucideClipboardList,
    lucideChevronDown,
    lucideDownload,
    lucideFileText,
    lucideBrain,
    lucideLightbulb,
    lucideTarget,
    lucideLoader2,
    lucideChevronLeft,
    lucideActivity,
    lucideArrowRight,
    lucideZap,
    lucideTrash2,
    lucidePlus,
    lucideLinkedin,
    lucideRotateCw,
    lucideArrowLeft
} from '@ng-icons/lucide';

type WorkstationTab = 'overview' | 'context' | 'coach' | 'documents' | 'interview' | 'strategy';

@Component({
    selector: 'app-job-workstation',
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        NgIcon,
        ReactiveFormsModule,
        ...HlmInputImports,
        ...HlmLabelImports,
        ...HlmTabsImports,
        ...BrnTabsImports,
        ...HlmSeparatorImports,
        ...HlmCardImports,
        ...HlmButtonImports,
        ...HlmBadgeImports,
        ...HlmBreadCrumbImports,
        ...HlmDropdownMenuImports
    ],
    providers: [
        provideIcons({
            lucideLayoutDashboard,
            lucideFileSearch,
            lucideSparkles,
            lucideFolderKanban,
            lucideMic2,
            lucideSwords,
            lucideCalendar,
            lucideMapPin,
            lucideChevronRight,
            lucideExternalLink,
            lucideClipboardList,
            lucideChevronDown,
            lucideDownload,
            lucideFileText,
            lucideBrain,
            lucideLightbulb,
            lucideTarget,
            lucideLoader2,
            lucideChevronLeft,
            lucideActivity,
            lucideArrowRight,
            lucideZap,
            lucideTrash2,
            lucidePlus,
            lucideLinkedin,
            lucideRotateCw,
            lucideArrowLeft
        })
    ],
    styleUrls: ['./workstation-animations.css'],
    templateUrl: './job-workstation.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobWorkstationComponent implements OnInit {
    public readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly applicationService = inject(ApplicationService);
    private readonly documentService = inject(DocumentService);
    private readonly notificationService = inject(NotificationService);
    private readonly breadcrumbService = inject(BreadcrumbService);
    private readonly companyService = inject(CompanyService);

    // Core state
    application = signal<JobApplication | null>(null);
    companyContacts = signal<CompanyContact[]>([]);
    isLoading = signal(true);
    error = signal<string | null>(null);

    // Inline Editing State
    editingField = signal<string | null>(null);
    lastSavedField = signal<string | null>(null);

    // Forms
    editForm = inject(FormBuilder).group({
        position: ['', [Validators.required, Validators.maxLength(100)]]
    });

    // Tab state
    activeTab = signal<WorkstationTab>('overview');
    aiCoachActiveTab = signal<'suggestions' | 'analysis'>('suggestions');
    tabs: { id: WorkstationTab; label: string; icon: string }[] = [
        { id: 'overview', label: 'Overview', icon: 'lucideLayoutDashboard' },
        { id: 'context', label: 'Job Context', icon: 'lucideFileSearch' },
        { id: 'coach', label: 'AI Coach', icon: 'lucideSparkles' },
        { id: 'documents', label: 'Documents', icon: 'lucideFolderKanban' },
        { id: 'interview', label: 'Interview Prep', icon: 'lucideMic2' },
        { id: 'strategy', label: 'Strategy', icon: 'lucideSwords' },
    ];

    // Status management
    statusOptions = [
        { value: JobApplicationStatus.Applied, label: 'Applied' },
        { value: JobApplicationStatus.PhoneScreen, label: 'Phone Screen' },
        { value: JobApplicationStatus.TechnicalTask, label: 'Technical Task' },
        { value: JobApplicationStatus.Interviewing, label: 'Interviewing' },
        { value: JobApplicationStatus.Offer, label: 'Offer Received' },
        { value: JobApplicationStatus.Accepted, label: 'Accepted' },
        { value: JobApplicationStatus.Rejected, label: 'Rejected' },
        { value: JobApplicationStatus.Ghosted, label: 'Ghosted' },
    ];
    isStatusDropdownOpen = signal(false);

    // Priority Options
    priorityOptions = [
        { value: JobPriority.High, label: 'High Priority' },
        { value: JobPriority.Medium, label: 'Medium Priority' },
        { value: JobPriority.Low, label: 'Low Priority' },
    ];

    // Workplace Options
    workplaceOptions = [
        { value: WorkplaceType.OnSite, label: 'On-site' },
        { value: WorkplaceType.Remote, label: 'Remote' },
        { value: WorkplaceType.Hybrid, label: 'Hybrid' },
    ];

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

    // Interview Prep State
    interviewQuestions = signal<{ id: number; question: string; answer: string; category: string; flipped: boolean }[]>([
        {
            id: 1,
            question: "Can you tell me about yourself and your experience with Angular?",
            answer: "Focus on your role in the JobTracker project, emphasizing the use of Signals for state management and Spartan UI for the atomic design system. Mention the performance gains from lazy-loaded feature modules.",
            category: "Behavioral",
            flipped: false
        },
        {
            id: 2,
            question: "How do you handle state management in large scale applications?",
            answer: "Discuss the shift from RxJS-heavy patterns to the signal-based architecture in Angular. Explain how Signals provide local reactivity without full zone.js pollution.",
            category: "Technical",
            flipped: false
        },
        {
            id: 3,
            question: "Why do you want to work at this company?",
            answer: "Use the insights from the Job Intelligence tab. Pivot to their tech stack or mission statement found during analysis.",
            category: "Culture",
            flipped: false
        }
    ]);
    isGeneratingQuestions = signal(false);
    activeFlashcardIndex = signal(0);
    isFlashcardFlipped = signal(false);
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
        if (score >= 80) return 'text-success';
        if (score >= 50) return 'text-warning';
        return 'text-destructive';
    });

    matchScoreBg = computed(() => {
        const score = this.application()?.matchScore ?? 0;
        if (score >= 80) return 'bg-success/20';
        if (score >= 50) return 'bg-warning/20';
        return 'bg-muted/30';
    });

    startEditing(field: string): void {
        const app = this.application();
        if (!app) return;

        if (field === 'position') {
            this.editForm.patchValue({ position: app.position });
        }

        this.editingField.set(field);
    }

    saveField(field: string): void {
        const app = this.application();
        if (!app) return;

        if (field === 'position') {
            const newPosition = this.editForm.get('position')?.value;
            if (!newPosition || newPosition === app.position) {
                this.editingField.set(null);
                return;
            }

            this.applicationService.updateApplication(app.id, { ...app, position: newPosition }).subscribe({
                next: () => {
                    this.application.update(prev => prev ? { ...prev, position: newPosition } : null);
                    this.editingField.set(null);
                    this.lastSavedField.set(field);
                    this.notificationService.success('Position updated', 'Success');
                    setTimeout(() => this.lastSavedField.set(null), 2000);
                },
                error: () => {
                    this.notificationService.error('Failed to update position', 'Error');
                    this.editingField.set(null);
                }
            });
        }
    }

    async deleteApplication(): Promise<void> {
        const app = this.application();
        if (!app) return;

        const confirmed = await this.notificationService.confirm(
            `This will permanently delete your application for "${app.position}" at ${app.companyName}. This action cannot be undone.`,
            'Delete Application?',
            {
                confirmText: 'Delete Mission',
                isDangerous: true,
            },
        );

        if (!confirmed) return;

        this.applicationService.deleteApplication(app.id).subscribe({
            next: () => {
                this.notificationService.success(
                    'Application has been purged from records.',
                    'Mission Terminated'
                );
                this.router.navigate(['/applications']);
            },
            error: (err) => {
                console.error('[JobWorkstation] Delete failed:', err);
                this.notificationService.error(
                    'Unable to complete the erasure. Please try again.',
                    'Operation Failed'
                );
            },
        });
    }

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
        // Check local snapshot OR parent snapshot for the ID
        const id = this.route.snapshot.paramMap.get('id') ||
            this.route.parent?.snapshot.paramMap.get('id');

        if (id) {
            const parsedId = Number.parseInt(id, 10);
            if (!isNaN(parsedId)) {
                this.loadApplication(parsedId);
                this.loadDocuments();

                // Set initial tab from query params if available
                const tab = this.route.snapshot.queryParamMap.get('tab') as WorkstationTab;
                if (tab && this.tabs.some(t => t.id === tab)) {
                    this.activeTab.set(tab);
                    this.breadcrumbService.setLastWorkstationState(parsedId, tab);
                } else {
                    this.breadcrumbService.setLastWorkstationState(parsedId, this.activeTab());
                }
            } else {
                this.error.set(`Invalid application ID: ${id}`);
                this.isLoading.set(false);
            }
        } else {
            console.error('No ID found in route!');
            this.error.set('Mission context missing (No ID found in route)');
            this.isLoading.set(false);
        }
    }

    private loadApplication(id: number): void {
        this.isLoading.set(true);
        this.applicationService.getApplicationById(id).subscribe({
            next: (app) => {
                this.application.set(app);
                this.jobDescriptionInput.set(app.jobDescription || '');
                this.generateMockTimeline(app);

                // Load company hierarchy for contact selection
                this.loadCompanyContacts(app.companyId);

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

    private loadCompanyContacts(companyId: number): void {
        this.companyService.getCompanyDetails(companyId).subscribe({
            next: (details) => {
                this.companyContacts.set(details.contacts || []);
            },
            error: (err: unknown) => console.error('Error loading company contacts:', err)
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
    setActiveTab(tab: string | WorkstationTab): void {
        const tabId = tab as WorkstationTab;
        this.activeTab.set(tabId);
        this.isMobileMenuOpen.set(false);
        const app = this.application();
        if (app) {
            this.breadcrumbService.setLastWorkstationState(app.id, tabId);
        }

        // Sync with query params for persistence
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab: tabId },
            queryParamsHandling: 'merge'
        });
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

    // Priority Selection
    selectPriority(priority: JobPriority): void {
        const app = this.application();
        if (!app) return;

        this.applicationService.updateApplication(app.id, { ...app, priority }).subscribe({
            next: () => {
                this.application.set({ ...app, priority });
                this.notificationService.success('Priority updated', 'Success');
            },
            error: () => this.notificationService.error('Failed to update priority', 'Error'),
        });
    }

    // Workplace Selection
    selectWorkplace(workplaceType: WorkplaceType): void {
        const app = this.application();
        if (!app) return;

        this.applicationService.updateApplication(app.id, { ...app, workplaceType }).subscribe({
            next: () => {
                this.application.set({ ...app, workplaceType });
                this.notificationService.success('Workplace updated', 'Success');
            },
            error: () => this.notificationService.error('Failed to update workplace', 'Error'),
        });
    }

    selectPrimaryContact(contactId: number): void {
        const app = this.application();
        if (!app) return;

        this.applicationService.updateApplication(app.id, { ...app, primaryContactId: contactId }).subscribe({
            next: () => {
                const contact = this.companyContacts().find(c => c.id === contactId);
                this.application.set({ ...app, primaryContactId: contactId, primaryContact: contact });
                this.notificationService.success('Primary contact assigned', 'Registry Updated');
            },
            error: () => this.notificationService.error('Failed to assign contact', 'Error')
        });
    }

    getStatusLabel(status: JobApplicationStatus | undefined): string {
        if (status === undefined) return 'Unknown';
        return this.statusOptions.find((o) => o.value === status)?.label || 'Unknown';
    }

    getStatusClass(status: JobApplicationStatus | undefined): string {
        const base = 'text-sm px-3 py-1.5 font-medium border transition-all duration-300';
        if (status === undefined) return base;

        switch (status as JobApplicationStatus) {
            case JobApplicationStatus.Applied:
                return `${base} bg-info/10 text-info border-info/20`;
            case JobApplicationStatus.PhoneScreen:
                return `${base} bg-info/15 text-info border-info/30`;
            case JobApplicationStatus.TechnicalTask:
                return `${base} bg-warning/10 text-warning border-warning/20`;
            case JobApplicationStatus.Interviewing:
                return `${base} bg-primary/10 text-primary border-primary/20`;
            case JobApplicationStatus.Offer:
                return `${base} bg-success/15 text-success border-success/30`;
            case JobApplicationStatus.Accepted:
                return `${base} bg-success/10 text-success border-success/20`;
            case JobApplicationStatus.Rejected:
                return `${base} bg-destructive/10 text-destructive border-destructive/20`;
            case JobApplicationStatus.Ghosted:
                return `${base} bg-muted text-muted-foreground border-border`;
            default:
                return `${base} bg-secondary text-secondary-foreground border-border`;
        }
    }

    getJobTypeLabel(type: JobType | undefined): string {
        if (type === undefined) return 'Unknown';
        switch (type) {
            case JobType.FullTime: return 'Full-time';
            case JobType.PartTime: return 'Part-time';
            case JobType.Internship: return 'Internship';
            case JobType.Contract: return 'Contract';
            case JobType.Freelance: return 'Freelance';
            default: return 'Unknown';
        }
    }

    getWorkplaceLabel(type: WorkplaceType | undefined): string {
        if (type === undefined) return 'Unknown';
        switch (type) {
            case WorkplaceType.OnSite: return 'On-site';
            case WorkplaceType.Remote: return 'Remote';
            case WorkplaceType.Hybrid: return 'Hybrid';
            default: return 'Unknown';
        }
    }

    getPriorityLabel(priority: JobPriority | undefined): string {
        if (priority === undefined) return 'Medium';
        switch (priority) {
            case JobPriority.High: return 'High Priority';
            case JobPriority.Medium: return 'Medium Priority';
            case JobPriority.Low: return 'Low Priority';
            default: return 'Medium';
        }
    }

    getPriorityClass(priority: JobPriority | undefined): string {
        const base = 'text-sm px-3 py-1.5 font-medium border transition-all duration-300';
        if (priority === undefined) return base;

        switch (priority as JobPriority) {
            case JobPriority.High:
                return `${base} bg-destructive/10 text-destructive border-destructive/20`;
            case JobPriority.Medium:
                return `${base} bg-warning/10 text-warning border-warning/20`;
            case JobPriority.Low:
                return `${base} bg-info/10 text-info border-info/20`;
            default:
                return `${base} bg-secondary text-secondary-foreground border-border`;
        }
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

        // Note: The mock data provided in the instruction has a different structure
        // than the InterviewQuestion interface. For faithful application of the change,
        // the `interviewQuestions` signal type was updated to match the provided mock.
        // If the original InterviewQuestion interface should be strictly adhered to,
        // the mock data would need to be adjusted.
        // This `generateInterviewQuestions` method is now redundant if the signal is
        // initialized with mock data, but kept for completeness based on original code.
        // If the intent is to replace the initial empty array with this generated data,
        // then the initial signal definition should be empty and this method would populate it.
        // Given the instruction, the signal is initialized with the mock data directly.

        // this.interviewQuestions.set(questions); // This line would be used if generating dynamically
        this.isGeneratingQuestions.set(false);
    }

    toggleQuestion(id: string): void {
        this.expandedQuestionId.update((current) => (current === id ? null : id));
    }

    updateAnswer(questionId: string, answer: string): void {
        // This method assumes the original InterviewQuestion type with string IDs.
        // If the new mock data with number IDs is used, this method would need adjustment.
        // For now, it's kept as is, assuming it might be used for dynamically generated questions.
        // If the mock data is the only source, this method might become obsolete or need refactoring.
        this.interviewQuestions.update((questions) =>
            questions.map((q) => (q.id === parseInt(questionId) ? { ...q, answer: answer } : q)),
        );
    }

    // Flashcard methods
    flipFlashcard(): void {
        this.isFlashcardFlipped.update(v => !v);
    }

    updateCoverLetterContent(content: string): void {
        this.coverLetter.update(s => ({ ...s, content, isEdited: true }));
    }

    flipCard(id: number): void {
        this.interviewQuestions.update(questions =>
            questions.map(q => q.id === id ? { ...q, flipped: !q.flipped } : q)
        );
    }

    setAiCoachTab(tab: 'suggestions' | 'analysis'): void {
        this.aiCoachActiveTab.set(tab);
    }

    updateStrategyNotes(notes: string): void {
        this.strategyNotes.set(notes);
    }

    nextFlashcard(): void {
        if (this.activeFlashcardIndex() < this.interviewQuestions().length - 1) {
            this.activeFlashcardIndex.update(i => i + 1);
            this.isFlashcardFlipped.set(false);
        }
    }

    prevFlashcard(): void {
        if (this.activeFlashcardIndex() > 0) {
            this.activeFlashcardIndex.update(i => i - 1);
            this.isFlashcardFlipped.set(false);
        }
    }


    /**
     * Download a document
     */
    downloadDocument(document: Document): void {
        if (!document) return;

        // Try direct URL if available
        if (document.fileUrl) {
            window.open(document.fileUrl, '_blank');
            return;
        }

        // Otherwise use the document service (logic would typically go here to fetch blob)
        this.notificationService.info(`Downloading ${document.originalFileName}...`, 'Document Fetch');

        // Note: Real implementation would wait for document content and trigger download
        // window.location.href = `/api/documents/download/${document.id}`;
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
        this.location.back();
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
