/**
 * AI-generated tailored assets (resume + cover letter) and analysis summaries.
 * Exactly mirrors AiGeneratedAssetsDto from the backend.
 */
export interface AiGeneratedAssets {
    matchScore: number;
    goodPoints: string[];
    gaps: string[];
    advice: string[];
    aiFeedback: string;
    tailoredResume: string;
    tailoredCoverLetter: string;
}
