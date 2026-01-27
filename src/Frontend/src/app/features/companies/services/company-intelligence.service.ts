import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { CompanyNews } from '../models/company.model';

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
}
