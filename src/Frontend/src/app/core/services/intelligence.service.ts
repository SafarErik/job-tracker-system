import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

import { Observable, of, delay } from 'rxjs';

export interface GlobalSignal {
    id: string;
    headline: string;
    summary: string;
    impactScore: number;
    source: string;
    sourceFavicon: string;
    timestamp: Date;
    tags: string[];
    category: 'Market' | 'Tech' | 'Hiring' | 'Layoffs' | 'M&A';
}

// ... (existing code)

export interface CareerOpportunity {
    id: string;
    roleTitle: string;
    company: string;
    location: string;
    matchScore: number;
    salaryRange: string;
    source: string;
    logoUrl?: string; // Optional logo
}

@Injectable({
    providedIn: 'root',
})
export class IntelligenceService {
    /**
     * Mock data for global signals
     */
    private readonly _mockSignals: GlobalSignal[] = [
        {
            id: '1',
            headline: 'NVIDIA Announces New AI-Driven Cloud Infrastructure for FinTech',
            summary: 'A massive shift in hardware requirements is expected as NVIDIA rolls out Blackwell-based instances specifically tuned for high-frequency trading and financial modeling.',
            impactScore: 85,
            source: 'TechCrunch',
            sourceFavicon: 'https://techcrunch.com/favicon.ico',
            timestamp: new Date(),
            tags: ['AI', 'FinTech', 'NVIDIA'],
            category: 'Tech'
        },
        {
            id: '2',
            headline: 'Remote Work Mandates Tighten Across FAANG Companies',
            summary: 'Leaked internal memos suggest a transition to 4-day in-office minimums by Q3 2026. This move is triggering a talent migration towards tier-2 specialized AI startups.',
            impactScore: 92,
            source: 'The Verge',
            sourceFavicon: 'https://www.theverge.com/favicon.ico',
            timestamp: new Date(Date.now() - 3600000 * 2),
            tags: ['WorkCulture', 'FAANG', 'Career'],
            category: 'Hiring'
        },
        {
            id: '3',
            headline: 'Cybersecurity Spend Reaches All-Time High in EU Post-Regulation',
            summary: 'New compliance requirements in the EU have forced the Fortune 500 to expand their security teams. Senior Security Architect roles have seen a 25% salary increase.',
            impactScore: 78,
            source: 'Reuters',
            sourceFavicon: 'https://www.reuters.com/pf/resources/images/reuters/favicon.ico',
            timestamp: new Date(Date.now() - 3600000 * 5),
            tags: ['Cybersecurity', 'EU', 'Jobs'],
            category: 'Market'
        },
        {
            id: '4',
            headline: 'OpenAI Previews "Operative" - A Tool for Autonomous Workflow Management',
            summary: 'The new model series is designed to handle multi-step reasoning tasks previously reserved for human project managers. Integration with Jira and Slack is native.',
            impactScore: 95,
            source: 'Wired',
            sourceFavicon: 'https://www.wired.com/favicon.ico',
            timestamp: new Date(Date.now() - 3600000 * 8),
            tags: ['OpenAI', 'Automation', 'Productivity'],
            category: 'Tech'
        },
        {
            id: '5',
            headline: 'Fintech Unicorn "Vantage" Acquires Competitor for $1.2B',
            summary: 'In a surprise move, Vantage consolidate market share in the job tracking and career intelligence space. New hire initiatives expected for their London R&D hub.',
            impactScore: 88,
            source: 'Bloomberg',
            sourceFavicon: 'https://www.bloomberg.com/favicon.ico',
            timestamp: new Date(Date.now() - 3600000 * 12),
            tags: ['M&A', 'Fintech', 'Jobs'],
            category: 'M&A'
        }
    ];

    private readonly _mockOpportunities: CareerOpportunity[] = [
        {
            id: '101',
            roleTitle: 'Senior Frontend Engineer',
            company: 'Vantage Systems',
            location: 'London, UK (Hybrid)',
            matchScore: 98,
            salaryRange: '£90k - £120k',
            source: 'LinkedIn',
            logoUrl: `https://logo.dev/twitter.com?token=${environment.logoDevToken}` // Placeholder
        },
        {
            id: '102',
            roleTitle: 'Lead Product Designer',
            company: 'Nebula Corp',
            location: 'Remote (EU)',
            matchScore: 92,
            salaryRange: '€100k - €140k',
            source: 'Greenhouse',
            logoUrl: `https://logo.dev/google.com?token=${environment.logoDevToken}` // Placeholder
        },
        {
            id: '103',
            roleTitle: 'AI Solutions Architect',
            company: 'Cyberdyne',
            location: 'San Francisco, CA',
            matchScore: 88,
            salaryRange: '$180k - $250k',
            source: 'Wellfound',
            logoUrl: `https://logo.dev/openai.com?token=${environment.logoDevToken}` // Placeholder
        }
    ];

    /**
     * Fetches global signals based on skills and job title
     * @param skills List of user skills
     * @param jobTitle User's job title
     */
    getGlobalSignals(skills: string[], jobTitle: string): Observable<GlobalSignal[]> {
        // Simulating API call latency
        return of(this._mockSignals).pipe(delay(1500));
    }

    getCareerOpportunities(): Observable<CareerOpportunity[]> {
        return of(this._mockOpportunities).pipe(delay(1000));
    }
}

