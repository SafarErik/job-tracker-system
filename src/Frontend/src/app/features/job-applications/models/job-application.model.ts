import { JobApplicationStatus } from './application-status.enum';

export interface JobApplication {
  id: number;
  position: string;
  jobUrl?: string;
  jobDescription?: string; // Full job posting text for AI analysis
  description?: string; // Private notes (salary, thoughts, etc.)
  appliedAt: string; // ISO date string in JSON
  status: JobApplicationStatus;
  companyId: number;
  companyName?: string;
  documentId?: string | null;
  documentName?: string | null;
}

export interface CreateJobApplication {
  position: string;
  companyId: number;
  jobUrl?: string;
  jobDescription?: string; // Full job posting text for AI analysis
  description?: string; // Private notes (salary, thoughts, etc.)
  status: JobApplicationStatus;
  documentId?: string | null;
}

