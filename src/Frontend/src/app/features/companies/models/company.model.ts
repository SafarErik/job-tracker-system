export interface Company {
  id: string;
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  totalApplications: number;
  priority: string;
  updatedAt?: string;
  // For rich display in list view
  recentApplications?: ApplicationPreview[];
}

export interface ApplicationPreview {
  id: string;
  position: string;
  status: string;
}

export interface CreateCompany {
  name: string;
  website?: string;
  address?: string;
  industry?: string;
  techStack?: string[];
  priority?: string;
  notes?: string;
  // Mapped to backend DTO
  contacts?: CompanyContact[];
  // Legacy flat fields (optional, for form internal use)
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
}

export interface UpdateCompany {
  name?: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  priority?: string;
  notes?: string;
  contacts?: CompanyContact[];
}

export interface CompanyDetail {
  id: string;
  name: string;
  website?: string;
  address?: string;
  hrContactName?: string;
  hrContactEmail?: string;
  hrContactLinkedIn?: string;
  industry?: string;
  techStack?: string[];
  totalApplications: number;
  priority: string;
  updatedAt?: string;
  applicationHistory: JobApplicationHistory[];
  // Intelligence fields (mock data for now)
  contacts?: CompanyContact[];
  notes?: string;
  compatibility?: CompatibilityIndex;
}

export interface CompatibilityIndex {
  score: number;
  pros: string[];
  cons: string[];
}

import type { CompanyContact } from '../../../core/models/company-contact.model';
export type { CompanyContact };

export interface JobApplicationHistory {
  id: string;
  position: string;
  appliedAt: string;
  status: string;
  salaryOffer?: number;
}

// Mock news service types
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


export interface TacticalEvent {
  id: string;
  type: 'Application' | 'Follow-up' | 'Networking' | 'Interview' | 'Outcome';
  date: string | Date;
  title: string;
  subtitle?: string;
  status?: string; // Original status if applicable
  description?: string; // AI notes or manual notes
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
