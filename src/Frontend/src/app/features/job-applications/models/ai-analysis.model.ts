/**
 * ============================================================================
 * AI ANALYSIS MODELS - Workstation AI Features
 * ============================================================================
 */

/**
 * Result of AI analysis on a job description
 */
export interface AiAnalysisResult {
    matchScore: number; // 0-100
    gapAnalysis: string; // Text explaining the match score
    missingSkills: string[]; // Skills not found in user's profile
    matchedSkills: string[]; // Skills that match
    resumeEnhancements: ResumeEnhancement[];
    generatedAt: Date;
}

/**
 * AI-generated tailored assets
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

/**
 * A single resume bullet point enhancement suggestion
 */
export interface ResumeEnhancement {
    id: string;
    originalBullet: string;
    rebrandedBullet: string;
    reasoning: string;
    category: 'experience' | 'skill' | 'achievement';
}

/**
 * Interview question with user's draft answer
 */
export interface InterviewQuestion {
    id: string;
    question: string;
    category: 'behavioral' | 'technical' | 'situational' | 'company';
    difficulty: 'easy' | 'medium' | 'hard';
    draftAnswer: string;
    tips?: string;
}

/**
 * Timeline event for application history
 */
export interface TimelineEvent {
    id: string;
    type: 'created' | 'applied' | 'status_change' | 'ai_analysis' | 'document_attached' | 'interview_scheduled' | 'note_added';
    title: string;
    description?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

/**
 * Cover letter draft with generation metadata
 */
export interface CoverLetterDraft {
    content: string;
    generatedAt?: Date;
    basedOnResumeId?: string;
    isEdited: boolean;
}
