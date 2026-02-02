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
  jobDescription?: string; // The "Source of Truth" for AI
  description?: string; // Private User Notes
  location?: string; // e.g. "Budapest"

  // Frontend/AI Computed
  matchScore: number; // 0-100
  skills: string[]; // Extracted keywords
  aiFeedback?: string; // The "Coach" output

  // Relations
  documentId?: string | null; // The specific CV version used
  primaryContactId?: string;
  primaryContact?: CompanyContact;
}

export interface CreateJobApplication {
  position: string;
  companyId: string;
  department?: string;
  referenceId?: string;
  jobUrl?: string;
  jobDescription?: string; // Full job posting text for AI analysis
  description?: string; // Private notes (salary, thoughts, etc.)
  status: JobApplicationStatus;
  documentId?: string | null;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  priority?: JobPriority;
  salaryMin?: number;
  salaryMax?: number;
  salaryOffer?: number;
  currency?: string;
  salaryPeriod?: string;
  matchScore?: number;
  generatedCoverLetter?: string;
  aiFeedback?: string;
  primaryContactId?: string;
}

