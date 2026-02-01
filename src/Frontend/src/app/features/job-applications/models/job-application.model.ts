import { JobApplicationStatus } from './application-status.enum';
import { JobType } from './job-type.enum';
import { WorkplaceType } from './workplace-type.enum';
import { JobPriority } from './job-priority.enum';
import { CompanyContact } from '../../companies/models/company.model';

export interface JobApplication {
  id: string;
  position: string;
  jobUrl?: string;
  jobDescription?: string; // Full job posting text for AI analysis
  description?: string; // Private notes (salary, thoughts, etc.)
  appliedAt: string; // ISO date string in JSON
  status: JobApplicationStatus;
  companyId: string;
  companyName?: string;
  documentId?: string | null;
  documentName?: string | null;
  // Workstation fields (frontend-computed or optional from backend)
  jobType: JobType;
  workplaceType: WorkplaceType;
  priority: JobPriority;
  matchScore: number;
  salaryOffer?: number;
  generatedCoverLetter?: string;
  aiFeedback?: string;
  skills: string[];
  primaryContactId?: string;
  primaryContact?: CompanyContact;
  rowVersion: number;
}

export interface CreateJobApplication {
  position: string;
  companyId: string;
  jobUrl?: string;
  jobDescription?: string; // Full job posting text for AI analysis
  description?: string; // Private notes (salary, thoughts, etc.)
  status: JobApplicationStatus;
  documentId?: string | null;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  priority?: JobPriority;
  matchScore?: number;
  generatedCoverLetter?: string;
  aiFeedback?: string;
  primaryContactId?: string;
}

