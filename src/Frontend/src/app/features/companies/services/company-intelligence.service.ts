import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
    CompanyDetail,
    CompanyNews,
    CompanyResearchBrief,
    IntelligenceBriefing
} from '../models/company.model';
import { CompanyPriority } from '../models/company-priority.enum';

/**
 * Mock Company Intelligence Service
 * Provides fake data for news, contacts, and other intelligence features.
 * In production, this would call actual APIs.
 */
@Injectable({
    providedIn: 'root',
})
export class CompanyIntelligenceService {
    private readonly mockHeadlines = [
        'Company announces major expansion into European markets',
        'Q4 earnings exceed analyst expectations by 15%',
        'New partnership with leading tech provider announced',
        'Company recognized as top employer in tech industry',
        'CEO shares vision for AI-powered future at conference',
        'Series B funding round closes at $50M valuation',
        'Company launches innovative product line for enterprise',
        'Strategic acquisition strengthens market position',
        'Sustainability initiative reduces carbon footprint by 30%',
        'Remote work policy update: Hybrid model to continue',
    ];

    private readonly mockSources = [
        'TechCrunch',
        'Bloomberg',
        'Reuters',
        'Forbes',
        'The Verge',
        'Business Insider',
    ];

    /**
     * Get mock news headlines for a company
     * @param companyName - The company name to fetch news for
     * @param count - Number of headlines to return (default 3)
     */
    getCompanyNews(companyName: string, count = 3): Observable<CompanyNews[]> {
        // Simulate API delay
        const news: CompanyNews[] = [];
        const shuffled = [...this.mockHeadlines].sort(() => 0.5 - Math.random());

        for (let i = 0; i < Math.min(count, shuffled.length); i++) {
            const daysAgo = Math.floor(Math.random() * 30) + 1;
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            news.push({
                id: `news-${i}-${Date.now()}`,
                title: shuffled[i].replace('Company', companyName),
                date: date.toISOString(),
                source: this.mockSources[Math.floor(Math.random() * this.mockSources.length)],
            });
        }

        // Sort by date (most recent first)
        news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return of(news).pipe(delay(500)); // Simulate network delay
    }

    /**
     * Get industry options for dropdown
     */
    getIndustryOptions(): string[] {
        return [
            'Technology',
            'Finance',
            'Healthcare',
            'E-commerce',
            'Education',
            'Manufacturing',
            'Media & Entertainment',
            'Consulting',
            'Real Estate',
            'Automotive',
            'Retail',
            'Telecommunications',
            'Other',
        ];
    }

    /**
     * Get common tech stack options for suggestions
     */
    getTechStackSuggestions(): string[] {
        return [
            'React',
            'Angular',
            'Vue.js',
            'Node.js',
            'Python',
            'Java',
            '.NET',
            'C#',
            'TypeScript',
            'JavaScript',
            'Go',
            'Rust',
            'Ruby',
            'PHP',
            'AWS',
            'Azure',
            'GCP',
            'Docker',
            'Kubernetes',
            'PostgreSQL',
            'MongoDB',
            'Redis',
            'GraphQL',
            'REST API',
        ];
    }

    /**
     * Generate an intelligence briefing for a company
     * @param companyName - The company name to generate for
     */
    generateIntelligenceBriefing(companyName: string): Observable<IntelligenceBriefing> {
        const briefing: IntelligenceBriefing = {
            mission: `${companyName} is an active company to research for role fit, team context, and application strategy. Review the product area, hiring signals, and interview angles before prioritizing outreach.`,
            fit: [
                'Deep technical expertise in distributed systems aligns with current architectural objectives.',
                'Proven capacity for scaling enterprise applications addresses immediate infrastructure needs.',
                'Strategic focus on AI-driven automation complements our long-term technical roadmap.'
            ],
            risks: `Rapid market shifts in the ${companyName} sector may lead to aggressive pivoting. Internal focus is currently consolidated on streamlining core service delivery.`
        };

        return of(briefing).pipe(delay(1500));
    }

    generateCompanyResearchBrief(company: CompanyDetail): Observable<CompanyResearchBrief> {
        const activeApplications = company.applicationHistory?.filter(app =>
            !['Rejected', 'Ghosted'].includes(app.status),
        ) ?? [];
        const techEvidence = (company.techStack ?? []).slice(0, 5);
        const hasContacts = (company.contacts ?? []).length > 0;
        const hasApplications = activeApplications.length > 0;
        const hasResearchContext = Boolean(company.notes?.trim() || company.description?.trim());
        const priorityBoost = company.priority === CompanyPriority.TopTier ? 14 : company.priority === CompanyPriority.MidTier ? 8 : 2;
        const readinessScore = Math.min(
            96,
            42 +
                priorityBoost +
                (hasApplications ? 18 : 0) +
                (hasContacts ? 12 : 0) +
                (hasResearchContext ? 12 : 0) +
                Math.min(12, techEvidence.length * 2),
        );

        const primaryStack = techEvidence.length ? techEvidence.join(', ') : 'the current product and team context';
        const activeRole = activeApplications[0]?.position ?? 'the next relevant role';
        const industry = company.industry || 'this market';
        const location = company.hqLocation || company.address || 'their main operating region';
        const today = new Date();

        const signalDate = (daysAgo: number) => {
            const date = new Date(today);
            date.setDate(date.getDate() - daysAgo);
            return date.toISOString();
        };

        const brief: CompanyResearchBrief = {
            generatedAt: today.toISOString(),
            sourceHash: this.buildSourceHash(company),
            readinessScore,
            executiveSummary: `${company.name} should be handled as a ${this.getPriorityLabel(company.priority).toLowerCase()} research target in ${industry}. Current evidence points to ${activeApplications.length || 'no'} active application${activeApplications.length === 1 ? '' : 's'}, ${company.contacts?.length || 0} known contact${company.contacts?.length === 1 ? '' : 's'}, and a useful context base around ${primaryStack}.`,
            strategicInsights: [
                {
                    title: hasApplications ? 'Active opportunity context is already available' : 'Research can start before an application is opened',
                    evidence: hasApplications
                        ? `${activeApplications.length} active application${activeApplications.length === 1 ? '' : 's'} can anchor the company narrative.`
                        : 'No active application is linked yet, so the company profile should guide future targeting.',
                    recommendation: hasApplications
                        ? `Tie company research directly to ${activeRole} before the next interview or follow-up.`
                        : 'Capture one target role or team so the research has a concrete decision point.',
                    tone: hasApplications ? 'strength' : 'neutral',
                },
                {
                    title: hasContacts ? 'Relationship context is usable' : 'Relationship map is still thin',
                    evidence: hasContacts
                        ? `${company.contacts.length} contact${company.contacts.length === 1 ? '' : 's'} available for outreach planning.`
                        : 'No recruiter, hiring manager, or peer contact has been added.',
                    recommendation: hasContacts
                        ? 'Use the strongest contact to validate team priorities and interview themes.'
                        : 'Add a recruiter or team contact before prioritizing outreach.',
                    tone: hasContacts ? 'strength' : 'risk',
                },
                {
                    title: techEvidence.length ? 'Capability evidence can support the pitch' : 'Capability evidence needs more detail',
                    evidence: techEvidence.length
                        ? `Known context includes ${primaryStack}.`
                        : 'No stack, product, or operating model evidence is available yet.',
                    recommendation: techEvidence.length
                        ? 'Turn the evidence into role-specific examples instead of listing technologies.'
                        : 'Add product, team, or stack notes once they are known.',
                    tone: techEvidence.length ? 'strength' : 'neutral',
                },
            ],
            marketSignals: [
                {
                    id: 'signal-product',
                    title: `${company.name} is likely prioritizing sharper product execution`,
                    source: 'Vadis research model',
                    date: signalDate(4),
                    summary: `The company profile suggests that product clarity, delivery cadence, and customer impact should be treated as core interview context for ${industry}.`,
                    whyItMatters: 'This gives you a safer way to connect your experience to business outcomes instead of only discussing responsibilities.',
                    interviewAngle: 'Ask how the team measures successful delivery over the next two quarters.',
                },
                {
                    id: 'signal-team',
                    title: `Team context in ${location} may affect hiring priorities`,
                    source: 'Company workspace data',
                    date: signalDate(11),
                    summary: `Location and company metadata point to a hiring conversation where operating model, collaboration rhythm, and stakeholder alignment may matter.`,
                    whyItMatters: 'It helps shape questions about hybrid work, team ownership, and decision making.',
                    interviewAngle: 'Ask what the team needs from a new hire in the first 60 days.',
                },
                {
                    id: 'signal-role',
                    title: hasApplications ? `${activeRole} creates a concrete research anchor` : 'A target role would improve the research brief',
                    source: 'Application history',
                    date: signalDate(17),
                    summary: hasApplications
                        ? `The active application gives the brief a specific role to prepare around.`
                        : 'Without an active role, the current brief is useful for company screening but weaker for interview preparation.',
                    whyItMatters: hasApplications
                        ? 'Role-specific research is easier to convert into resume, interview, and outreach actions.'
                        : 'The company can stay in the portfolio, but it needs a target role before deeper preparation.',
                    interviewAngle: hasApplications
                        ? 'Ask which part of the role has the highest urgency right now.'
                        : 'Use this company as a watch target until a fitting role appears.',
                },
            ],
            roleContext: {
                strengths: [
                    hasApplications
                        ? `Application history gives you a real workflow anchor for ${activeRole}.`
                        : 'The company is ready for discovery before committing application effort.',
                    techEvidence.length
                        ? `Known evidence around ${primaryStack} can be translated into practical examples.`
                        : 'The profile can still be improved with product, stack, and team notes.',
                    company.priority === CompanyPriority.TopTier
                        ? 'High priority status justifies deeper preparation time.'
                        : 'Priority can be adjusted after a stronger signal appears.',
                ],
                risks: [
                    hasContacts
                        ? 'Relationship context exists, but it still needs a clear next outreach step.'
                        : 'No known contact means outreach and referral paths are underdeveloped.',
                    hasResearchContext
                        ? 'Research notes should be kept current before interviews.'
                        : 'The brief is based on sparse local data until notes or description are added.',
                ],
                interviewQuestions: [
                    'What outcome would make the next six months successful for this team?',
                    'Where does this role create the most leverage for the business?',
                    'How does the team balance delivery speed with long-term maintainability?',
                    'Which collaboration patterns work best with the current organization?',
                ],
                techEvidence,
                learningPrompts: [
                    `Search: ${company.name} engineering blog product strategy`,
                    `Search: ${industry} hiring trends interview preparation`,
                    `Practice: explain one project through business impact, tradeoffs, and team collaboration`,
                ],
            },
            nextActions: [
                {
                    label: hasApplications ? 'Open active application' : 'Find a target role',
                    target: 'applications',
                    context: hasApplications
                        ? `Review ${activeRole} and connect company context to fit, assets, and interview prep.`
                        : 'Create or link an application before doing deep preparation.',
                },
                {
                    label: hasContacts ? 'Plan contact follow-up' : 'Add first contact',
                    target: 'people',
                    context: hasContacts
                        ? 'Use the contact list to choose the next message or validation question.'
                        : 'Add a recruiter, hiring manager, or team member to make outreach actionable.',
                },
                {
                    label: 'Review market signals',
                    target: 'market',
                    context: 'Use the signal summaries to prepare better questions and reduce generic interview answers.',
                },
                {
                    label: 'Prepare fit context',
                    target: 'fit',
                    context: 'Convert raw evidence into role-specific strengths, risks, and interview angles.',
                },
            ],
        };

        return of(brief).pipe(delay(500));
    }

    private buildSourceHash(company: CompanyDetail): string {
        return [
            company.id,
            company.name,
            company.industry ?? '',
            company.priority,
            company.totalApplications,
            company.techStack?.join('|') ?? '',
            company.contacts?.length ?? 0,
            company.notes?.length ?? 0,
        ].join('::');
    }

    private getPriorityLabel(priority: CompanyPriority): string {
        switch (priority) {
            case CompanyPriority.TopTier:
                return 'Priority';
            case CompanyPriority.MidTier:
                return 'Active';
            case CompanyPriority.Archived:
                return 'Archived';
            case CompanyPriority.LowTier:
            default:
                return 'Watchlist';
        }
    }
}
