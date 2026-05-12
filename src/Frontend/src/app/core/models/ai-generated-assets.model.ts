/**
 * Vadis-generated tailored assets (resume + cover letter) and analysis summaries.
 * Exactly mirrors AiGeneratedAssetsDto from the backend.
 */
import { FitReview } from './fit-review.model';

export interface AiGeneratedAssets {
    matchScore: number;
    goodPoints: string[];
    gaps: string[];
    advice: string[];
    aiFeedback: string;
    fitReview?: FitReview | null;
    tailoredResume: string;
    tailoredCoverLetter: string;
}
