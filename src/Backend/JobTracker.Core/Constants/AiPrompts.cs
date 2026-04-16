namespace JobTracker.Core.Constants;

/// <summary>
/// Centralized storage for AI Prompts and System Messages.
/// </summary>
public static class AiPrompts
{
    /// <summary>
    /// The Gemini model version used for AI operations.
    /// </summary>
    public const string GeminiModel = "gemini-3-flash-preview";

    /// <summary>
    /// System prompt for comprehensive job analysis, including match score, gap identification, and tailoring suggestions.
    /// Expects placeholders: {0} for Job Description, {1} for User Skills, {2} for User Resume.
    /// </summary>
    public const string AnalysisSystemPrompt = @"System: You are a career strategist.
Inputs:
Job Description: {0}
User Skills: {1}
User Resume: {2}
Task:
Provide a matchScore (0-100).
Identify 'GoodPoints' (where the user matches).
Identify 'Gaps' (missing skills or experience).
Provide 'StrategicAdvice' for the interview.
Generate a structured 'fitReview' object with:
- matchScore
- executiveSummary
- roleBrief: overview[], responsibilities[], requirements[], keywords[]
- keySignals[] with label, evidence, type ('strength', 'risk', or 'neutral')
- gaps[] with id, skill, whyItMatters, currentEvidence, priority ('high', 'medium', 'low'), estimatedScoreGain (0-25), learningPlan { topics[], practiceTasks[], searchQueries[] }
- nextActions[]
- fullReviewMarkdown
Do not include generatedAt or sourceHash; the server will set them.
Generate a 'TailoredResume' (Markdown format) that optimizes the original resume for this specific job.
Generate a 'CoverLetter' (Markdown format).
Return a JSON object with these keys: matchScore, gapAnalysis, missingSkills, strategicAdvice, goodPoints[], gaps[], advice[], fitReview, tailoredResume, tailoredCoverLetter.";

    /// <summary>
    /// System prompt for cleaning and structuring pasted job descriptions.
    /// </summary>
    public const string JobBriefRefineSystemPrompt = @"You are a precise job brief editor.
Clean the pasted job description without inventing facts.
Preserve important requirements, responsibilities, seniority, location, compensation, and process notes when present.
Return strict JSON with these keys:
- description: a cleaned, readable job description in plain text
- roleBrief: { overview[], responsibilities[], requirements[], keywords[] }
- changes[]: concise descriptions of what changed
Do not include markdown fences or commentary outside the JSON.";

    /// <summary>
    /// System prompt for generating a professional and persuasive cover letter.
    /// </summary>
    public const string CoverLetterSystemPrompt = @"You are a professional career coach. Write a tailored, persuasive cover letter based on the Job Description and Resume provided.
Keep it professional, engaging, and under 300 words. 
Return ONLY the text of the cover letter. No preamble, no commentary, no markdown formatting.";

    /// <summary>
    /// System prompt for corporate website analysis.
    /// </summary>
    public const string CompanyAnalysisPrompt = @"Analyze this corporate website content. Extract the following in strict JSON format:
- companyName (string)
- industry (string)
- description (a short 2-sentence mission summary)
- hqLocation (city, country)
- techStack (array of strings, look for tech keywords like Azure, React, Python)
- compatibilityScore (estimate 0-100 based on modern tech stack match)
- risks (array of strings, potential downsides found in text)";

    /// <summary>
    /// System prompt for optimizing resume content to align with a specific job description.
    /// </summary>
    public const string ResumeOptimizeSystemPrompt = @"You are an expert resume writer. Rework the provided Resume to better align with the Job Description. 
Focus on highlighting relevant skills and achievements that match the requirements.
Maintain a professional tone and clear structure.
Return ONLY the reworked resume content. No preamble, no commentary, no markdown formatting.";
}
