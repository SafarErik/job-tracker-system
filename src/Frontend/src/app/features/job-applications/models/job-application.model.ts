import { JobApplicationStatus } from './application-status.enum';
import { JobType } from './job-type.enum';
import { WorkplaceType } from './workplace-type.enum';
import { JobPriority } from './job-priority.enum';
import { Currency } from './currency.enum';
import { CompanyContact } from '../../../core/models/company-contact.model';
import { FitReview } from '../../../core/models/fit-review.model';

// ── Read DTO ─────────────────────────────────────────────

/**
 * Job application entity returned by `GET /api/jobapplications`.
 * Matches backend `JobApplicationDto` exactly.
 */
export interface JobApplication {
  id: string;
  position: string;
  jobUrl?: string;
  description?: string;

  // Vadis-generated fields
  generatedCoverLetter?: string;
  aiFeedback?: string;
  fitReview?: FitReview | null;
  matchScore: number;
  aiGoodPoints: string[];
  aiGaps: string[];
  aiAdvice: string[];
  /** Populated by `generateAssets` action — not in base DTO */
  tailoredResume?: string;

  // Dates & Status
  appliedAt: string;
  status: JobApplicationStatus;
  jobType: JobType;
  workplaceType: WorkplaceType;
  priority: JobPriority;

  // Compensation — matches backend `decimal?`
  salaryOffer?: number;
  baseSalary?: number;
  bonus?: number;
  equityValue?: number;
  currency: Currency;

  // Relations
  companyId: string;
  companyName?: string;
  documentId?: string | null;
  documentName?: string;
  skills: string[];
  primaryContact?: CompanyContact;

  /** Optimistic concurrency token from the backend */
  concurrencyToken: string;
}

// ── Create DTO ───────────────────────────────────────────

/**
 * Payload for `POST /api/jobapplications`.
 * Matches backend `CreateJobApplicationDto`.
 */
export interface CreateJobApplication {
  position: string;
  companyId: string;
  jobUrl?: string;
  description?: string;

  status?: JobApplicationStatus;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  priority?: JobPriority;

  salaryOffer?: number;
  baseSalary?: number;
  bonus?: number;
  equityValue?: number;
  currency?: Currency;

  matchScore?: number;
  documentId?: string | null;
  primaryContactId?: string;
}

// ── Update DTO ───────────────────────────────────────────

/**
 * Payload for `PUT /api/jobapplications/:id`.
 * Matches backend `UpdateJobApplicationDto`.
 * Uses `*Provided` flags to distinguish "not sent" from "set to null".
 */
export interface UpdateJobApplication {
  concurrencyToken: string;

  position?: string;
  companyId?: string;
  jobUrl?: string;
  description?: string;
  status?: JobApplicationStatus;
  jobType?: JobType;
  workplaceType?: WorkplaceType;
  priority?: JobPriority;

  salaryOffer?: number | null;
  salaryOfferProvided?: boolean;
  baseSalary?: number | null;
  baseSalaryProvided?: boolean;
  bonus?: number | null;
  bonusProvided?: boolean;
  equityValue?: number | null;
  equityValueProvided?: boolean;
  currency?: Currency;
  currencyProvided?: boolean;

  matchScore?: number;
  documentId?: string | null;
  documentIdProvided?: boolean;
  primaryContactId?: string;
}
