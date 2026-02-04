import { JobApplicationStatus } from '../../features/job-applications/models/application-status.enum';
import { JobType } from '../../features/job-applications/models/job-type.enum';
import { WorkplaceType } from '../../features/job-applications/models/workplace-type.enum';
import { JobPriority } from '../../features/job-applications/models/job-priority.enum';
import { CompanyContact } from './company-contact.model';

export interface JobApplication {
    id: string;
    position: string;
    companyId: string;
    companyName?: string;
    department?: string;
    referenceId?: string;
    status: JobApplicationStatus;
    priority: JobPriority;
    jobType: JobType;
    workplaceType: WorkplaceType;
    source?: string;
    appliedAt: string;
    updatedAt: string;
    nextFollowUpDate?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryOffer?: number;
    currency?: string;
    salaryPeriod?: 'yearly' | 'monthly' | 'hourly';
    jobUrl?: string;
    description?: string;
    location?: string;
    generatedCoverLetter?: string;
    matchScore: number;
    skills: string[];
    aiFeedback?: string;
    aiGoodPoints?: string[];
    aiGaps?: string[];
    aiAdvice?: string[];
    tailoredResume?: string;
    documentId?: string | null;
    documentName?: string;
    primaryContactId?: string;
    primaryContact?: CompanyContact;
}

export interface CreateJobApplication {
    position: string;
    companyId: string; // Renamed from companyName
    department?: string;
    referenceId?: string;
    jobUrl?: string;
    description?: string;
    status: JobApplicationStatus;
    documentId?: string | null;
    jobType: JobType; // Required
    workplaceType: WorkplaceType; // Required
    priority: JobPriority; // Required
    location?: string;
    source?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryOffer?: number;
    currency?: string;
    salaryPeriod?: string;
    nextFollowUpDate?: string;
    matchScore: number; // Required
    generatedCoverLetter?: string;
    aiFeedback?: string;
    primaryContactId?: string;
}
