export type FitSignalType = 'strength' | 'risk' | 'neutral';
export type FitGapPriority = 'high' | 'medium' | 'low';

export interface RoleBrief {
  overview: string[];
  responsibilities: string[];
  requirements: string[];
  keywords: string[];
}

export interface FitKeySignal {
  label: string;
  evidence: string;
  type: FitSignalType;
}

export interface FitLearningPlan {
  topics: string[];
  practiceTasks: string[];
  searchQueries: string[];
}

export interface FitGap {
  id: string;
  skill: string;
  whyItMatters: string;
  currentEvidence: string;
  priority: FitGapPriority;
  estimatedScoreGain: number;
  learningPlan: FitLearningPlan;
}

export interface FitReview {
  generatedAt: string;
  sourceHash: string;
  matchScore: number;
  executiveSummary: string;
  roleBrief: RoleBrief;
  keySignals: FitKeySignal[];
  gaps: FitGap[];
  nextActions: string[];
  fullReviewMarkdown: string;
}

export interface RefinedJobBrief {
  description: string;
  roleBrief: RoleBrief;
  changes: string[];
}
