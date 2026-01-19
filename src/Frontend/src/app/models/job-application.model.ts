import { JobApplicationStatus } from './application-status.enum';

export interface JobApplication {
  id: number;
  position: string;
  jobUrl?: string;
  description?: string;
  appliedAt: string; // ISO date string in JSON
  status: JobApplicationStatus;
  companyId: number;
  companyName?: string;
}

export interface CreateJobApplication {
  position: string;
  companyId: number;
  jobUrl?: string;
  description?: string;
  status: JobApplicationStatus;
}
