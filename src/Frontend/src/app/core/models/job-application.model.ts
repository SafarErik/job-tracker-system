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
    companyId: string;
    jobUrl?: string;
    description?: string;
    status: JobApplicationStatus;
    jobType: JobType;
    workplaceType: WorkplaceType;
    priority: JobPriority;
    salaryOffer?: number;
    matchScore: number;
    documentId?: string | null;
    primaryContactId?: string;
}
