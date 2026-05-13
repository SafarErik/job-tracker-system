import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

export interface GlobalSignal {
  id: string;
  headline: string;
  summary: string;
  impactScore: number;
  relevance: string;
  whyItMatters: string;
  recommendedAction: string;
  source: string;
  sourceUrl?: string;
  timestamp: Date;
  tags: string[];
  category: 'Market' | 'Technology' | 'Hiring' | 'Company' | 'Compensation';
}

export interface CareerOpportunity {
  id: string;
  roleTitle: string;
  company: string;
  location: string;
  workplace: 'Remote' | 'Hybrid' | 'On-site';
  matchScore: number;
  salaryRange: string;
  source: string;
  seniority: string;
  description: string;
  fitReasons: string[];
  roleSignals: string[];
  nextStep: string;
}

@Injectable({
  providedIn: 'root',
})
export class IntelligenceService {
  private readonly coreSignals: GlobalSignal[] = [
    {
      id: 'frontend-platform-demand',
      headline: 'Frontend platform roles are asking for stronger product ownership',
      summary:
        'Recent role patterns emphasize measurable product impact, design-system stewardship, and cross-functional delivery alongside framework depth.',
      impactScore: 82,
      relevance: 'Useful for frontend and full-stack candidates positioning themselves above feature delivery.',
      whyItMatters:
        'Applications are stronger when the CV connects UI work to adoption, performance, maintainability, or revenue outcomes.',
      recommendedAction:
        'Review one active application and add evidence for ownership, metrics, or design-system impact before applying.',
      source: 'Aptelion Core sample',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      tags: ['Frontend', 'Product', 'Design Systems'],
      category: 'Hiring',
    },
    {
      id: 'ai-product-integration',
      headline: 'AI-adjacent product work increasingly rewards integration judgment',
      summary:
        'Teams are separating candidates who can use AI tooling from candidates who can design reliable product workflows around it.',
      impactScore: 88,
      relevance: 'Relevant if your target roles mention AI features, workflow automation, or agentic tooling.',
      whyItMatters:
        'Aptelion Core should treat Vadis as guidance infrastructure, while private implementations can supply deeper reasoning later.',
      recommendedAction:
        'Write down one example where you turned an uncertain workflow into a clear user-facing decision path.',
      source: 'Aptelion Core sample',
      timestamp: new Date(Date.now() - 1000 * 60 * 130),
      tags: ['AI', 'Product', 'Architecture'],
      category: 'Technology',
    },
    {
      id: 'remote-role-signal',
      headline: 'Remote roles are more competitive when evidence is specific',
      summary:
        'Remote-friendly teams tend to look for async communication, ownership, documentation, and low-supervision delivery signals.',
      impactScore: 76,
      relevance: 'Helpful for candidates targeting remote or hybrid roles across multiple regions.',
      whyItMatters:
        'Generic remote-work claims rarely differentiate. Concrete examples of documented decisions and independent delivery do.',
      recommendedAction:
        'Add one bullet to your profile or CV that shows async collaboration or independent ownership.',
      source: 'Aptelion Core sample',
      timestamp: new Date(Date.now() - 1000 * 60 * 260),
      tags: ['Remote', 'Communication', 'Ownership'],
      category: 'Market',
    },
    {
      id: 'compensation-clarity',
      headline: 'Compensation clarity improves negotiation confidence',
      summary:
        'Candidates who track base, bonus, equity, and currency separately can compare opportunities with less ambiguity.',
      impactScore: 73,
      relevance: 'Useful when your pipeline includes multiple regions, contract types, or offer structures.',
      whyItMatters:
        'The offer view in Core can stay simple, but clean compensation data now creates room for stronger comparison later.',
      recommendedAction:
        'Fill in base salary, bonus, equity, and currency for any application where those values are known.',
      source: 'Aptelion Core sample',
      timestamp: new Date(Date.now() - 1000 * 60 * 420),
      tags: ['Compensation', 'Offer', 'Decision Clarity'],
      category: 'Compensation',
    },
  ];

  private readonly coreOpportunities: CareerOpportunity[] = [
    {
      id: 'northstar-frontend-platform',
      roleTitle: 'Senior Frontend Platform Engineer',
      company: 'Northstar Systems',
      location: 'London, UK',
      workplace: 'Hybrid',
      matchScore: 92,
      salaryRange: 'GBP 90k - 120k',
      source: 'Core preview',
      seniority: 'Senior',
      description:
        'Own shared UI infrastructure, design-system quality, and workflow improvements for a product engineering team.',
      fitReasons: ['Angular and TypeScript depth', 'Design-system ownership', 'Product-facing engineering impact'],
      roleSignals: ['Platform scope', 'Reusable UI foundations', 'Cross-team delivery'],
      nextStep: 'Save this opportunity, then open the workstation to add the real job posting and fit notes.',
    },
    {
      id: 'nebula-product-engineering',
      roleTitle: 'Product Engineer, Growth Systems',
      company: 'Nebula Works',
      location: 'Remote, EU',
      workplace: 'Remote',
      matchScore: 86,
      salaryRange: 'EUR 95k - 130k',
      source: 'Core preview',
      seniority: 'Mid/Senior',
      description:
        'Build customer-facing growth workflows with a strong bias toward measurement, iteration, and product clarity.',
      fitReasons: ['Full-stack product judgment', 'Experimentation mindset', 'Clear ownership examples'],
      roleSignals: ['Growth workflows', 'Metrics-oriented delivery', 'Remote collaboration'],
      nextStep: 'Save this opportunity if growth/product engineering is part of your target direction.',
    },
    {
      id: 'clearpath-solutions-architect',
      roleTitle: 'Solutions Architect, Developer Experience',
      company: 'Clearpath Labs',
      location: 'New York, NY',
      workplace: 'Hybrid',
      matchScore: 79,
      salaryRange: 'USD 150k - 190k',
      source: 'Core preview',
      seniority: 'Senior',
      description:
        'Partner with engineering teams to simplify developer workflows, technical onboarding, and integration paths.',
      fitReasons: ['Architecture communication', 'Developer tooling context', 'Stakeholder-facing delivery'],
      roleSignals: ['Technical enablement', 'Documentation quality', 'Integration design'],
      nextStep: 'Save this only if you want more architecture and enablement work in your pipeline.',
    },
  ];

  getGlobalSignals(skills: string[], jobTitle: string): Observable<GlobalSignal[]> {
    const normalizedSkills = skills.map((skill) => skill.toLowerCase());
    const normalizedTitle = jobTitle.toLowerCase();

    const sorted = [...this.coreSignals].sort((left, right) => {
      const leftRelevance = this.relevanceBoost(left, normalizedSkills, normalizedTitle);
      const rightRelevance = this.relevanceBoost(right, normalizedSkills, normalizedTitle);
      return right.impactScore + rightRelevance - (left.impactScore + leftRelevance);
    });

    return of(sorted).pipe(delay(500));
  }

  getCareerOpportunities(): Observable<CareerOpportunity[]> {
    return of(this.coreOpportunities).pipe(delay(500));
  }

  private relevanceBoost(signal: GlobalSignal, skills: string[], jobTitle: string): number {
    const text = `${signal.headline} ${signal.summary} ${signal.tags.join(' ')}`.toLowerCase();
    const skillBoost = skills.filter((skill) => text.includes(skill)).length * 8;
    const titleBoost = jobTitle && text.includes(jobTitle) ? 10 : 0;
    return skillBoost + titleBoost;
  }
}
