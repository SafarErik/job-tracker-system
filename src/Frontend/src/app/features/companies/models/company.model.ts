import { CompanyPriority } from './company-priority.enum';
import type { CompanyContact } from '../../../core/models/company-contact.model';

export type { CompanyContact };

// ── List View ────────────────────────────────────────────

/**
 * Company summary returned by `GET /api/companies`.
 * Matches backend `CompanyDto` exactly.
 */
export interface Company {
  id: string;
  name: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  hqLocation?: string;
  description?: string;
  industry?: string;
  compatibilityScore: number;
  priority: CompanyPriority;
  techStack: string[];
  totalApplications: number;
  recentApplications: JobApplicationHistory[];
}

// ── Detail View ──────────────────────────────────────────

/**
 * Detailed company view returned by `GET /api/companies/:id/details`.
 * Matches backend `CompanyDetailDto` exactly.
 */
export interface CompanyDetail extends Company {
  notes?: string;
  contacts: CompanyContact[];
  applicationHistory: JobApplicationHistory[];
}

// ── Create / Update ──────────────────────────────────────

/**
 * Payload for `POST /api/companies`.
 * Matches backend `CreateCompanyDto`.
 */
export interface CreateCompany {
  name: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  hqLocation?: string;
  description?: string;
  industry?: string;
  techStack?: string[];
  priority?: CompanyPriority;
  contacts?: CompanyContact[];
}

/**
 * Payload for `PUT /api/companies/:id`.
 * Matches backend `UpdateCompanyDto`.
 */
export interface UpdateCompany {
  name?: string;
  website?: string;
  address?: string;
  logoUrl?: string;
  hqLocation?: string;
  description?: string;
  industry?: string;
  notes?: string;
  techStack?: string[];
  priority?: CompanyPriority;
  contacts?: CompanyContact[];
}

// ── Shared Sub-types ─────────────────────────────────────

/**
 * Simplified job application snapshot shown in company views.
 * Matches backend `JobApplicationHistoryDto`.
 */
export interface JobApplicationHistory {
  id: string;
  position: string;
  appliedAt: string;
  status: string;
  salaryOffer?: number;
}

/** @deprecated Use `JobApplicationHistory` instead. */
export type ApplicationPreview = JobApplicationHistory;

// ── Intelligence / UI-only types ─────────────────────────

export interface CompanyNews {
  id: string;
  title: string;
  date: string;
  source: string;
  summary?: string;
}

export interface IntelligenceBriefing {
  mission: string;
  fit: string[];
  risks: string;
}

export interface CompatibilityIndex {
  score: number;
  pros: string[];
  cons: string[];
}

export interface TacticalEvent {
  id: string;
  type: 'Application' | 'Follow-up' | 'Networking' | 'Interview' | 'Outcome';
  date: string | Date;
  title: string;
  subtitle?: string;
  status?: string;
  description?: string;
  assets?: EventAsset[];
  meta?: {
    isGhosted?: boolean;
    isTerminal?: boolean;
    aiInsight?: string;
  };
}

export interface EventAsset {
  type: 'resume' | 'cover_letter' | 'link' | 'other';
  label: string;
  url: string;
}
