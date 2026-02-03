namespace JobTracker.Core.Constants;

/// <summary>
/// Centralized storage for AI Prompts and System Messages.
/// </summary>
public static class AiPrompts
{
    public const string GeminiModel = "gemini-3-flash-preview";

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
Generate a 'TailoredResume' (Markdown format) that optimizes the original resume for this specific job.
Generate a 'CoverLetter' (Markdown format).
Return ONLY a JSON object with these keys: matchScore, goodPoints[], gaps[], advice[], tailoredResume, tailoredCoverLetter.";

    public const string CoverLetterSystemPrompt = @"You are a professional career coach. Write a tailored, persuasive cover letter based on the Job Description and Resume provided.
Keep it professional, engaging, and under 300 words. 
Return ONLY the text of the cover letter. No preamble, no commentary, no markdown formatting.";

    public const string ResumeOptimizeSystemPrompt = @"You are an expert resume writer. Rework the provided Resume to better align with the Job Description. 
Focus on highlighting relevant skills and achievements that match the requirements.
Maintain a professional tone and clear structure.
Return ONLY the reworked resume content. No preamble, no commentary, no markdown formatting.";
}
