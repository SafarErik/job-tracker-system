import { JobApplicationStatus } from './application-status.enum';
import { JobType } from './job-type.enum';
import { WorkplaceType } from './workplace-type.enum';
import { JobPriority } from './job-priority.enum';
import { CompanyContact } from '../../../core/models/company-contact.model';

export interface JobApplication {
  id: string;
  position: string;
  companyId: string;
  companyName?: string; // Hydrated from backend
  department?: string; // e.g. "YouTube Team" or "Ads"
  referenceId?: string; // e.g. "JOB-12345"

  // Status & Metadata
  status: JobApplicationStatus;
  priority: JobPriority;
  jobType: JobType;
  workplaceType: WorkplaceType;
  source?: string;

  // Dates
  appliedAt: string;
  updatedAt: string;
  nextFollowUpDate?: string; // NEW: The "Trigger" for notifications 

  // Money related things
  salaryMin?: number;
  salaryMax?: number;
  salaryOffer?: number; // Hydrated if offer received
  currency?: string;
  salaryPeriod?: 'yearly' | 'monthly' | 'hourly';

  // Workstation Core Data
  jobUrl?: string;
  description?: string; // The "Source of Truth" for AI (Job Posting Text)
  location?: string; // e.g. "Budapest"
  generatedCoverLetter?: string;

  // Frontend/AI Computed
  matchScore: number; // 0-100
  skills: string[]; // Extracted keywords
  aiFeedback?: string; // The "Coach" output
  aiGoodPoints?: string[];
  aiGaps?: string[];
  aiAdvice?: string[];
  tailoredResume?: string;

  // Relations
  documentId?: string | null; // The specific CV version used
  documentName?: string;
  primaryContactId?: string;
  primaryContact?: CompanyContact;
}

export interface CreateJobApplication {
  position: string;
  companyName: string;
  department?: string;
  referenceId?: string;
  jobUrl?: string;
  description?: string; // Full job posting text for AI analysis
  status: JobApplicationStatus;
  documentId?: string | null;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  priority?: JobPriority;
  location?: string;
  source?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryOffer?: number;
  currency?: string;
  salaryPeriod?: string;
  nextFollowUpDate?: string;
  matchScore?: number;
  generatedCoverLetter?: string;
  aiFeedback?: string;
  primaryContactId?: string;
}

