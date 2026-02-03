namespace JobTracker.Core.Interfaces;

/// <summary>
/// Interface for AI-powered job analysis services.
/// Implementations analyze job descriptions against resumes to provide match scores and insights.
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Analyzes a job description against a resume to determine compatibility.
    /// </summary>
    /// <param name="jobDescription">The full text of the job posting</param>
    /// <param name="skillsList">Comma-separated list of the user's skills</param>
    /// <param name="resumeText">The user's resume/CV text content</param>
    /// <returns>Analysis results including match score, gap analysis, and strategic advice</returns>
    Task<AiAnalysisResult> AnalyzeJobAsync(string jobDescription, string skillsList, string resumeText);

    /// <summary>
    /// Generates a tailored cover letter based on the job description and user's resume.
    /// </summary>
    Task<string> GenerateCoverLetterAsync(string jobDescription, string resumeText, string companyName, string position);

    /// <summary>
    /// Provides an optimized version of the resume tailored for a specific job description.
    /// </summary>
    Task<string> OptimizeResumeAsync(string jobDescription, string resumeText);
}

/// <summary>
/// Result of an AI job analysis operation.
/// Contains match score, skill gaps, and strategic recommendations.
/// </summary>
public class AiAnalysisResult
{
    /// <summary>
    /// Match percentage between 0-100 indicating resume-job compatibility
    /// </summary>
    public int MatchScore { get; set; }

    /// <summary>
    /// Detailed analysis of gaps between the resume and job requirements
    /// </summary>
    public string GapAnalysis { get; set; } = string.Empty;

    /// <summary>
    /// List of skills mentioned in the job that are missing from the resume
    /// </summary>
    public List<string> MissingSkills { get; set; } = new();

    /// <summary>
    /// Strategic advice for the applicant (tailoring tips, interview prep, etc.)
    /// </summary>
    public string StrategicAdvice { get; set; } = string.Empty;

    /// <summary>
    /// Specific strengths that match the job requirements
    /// </summary>
    public List<string> GoodPoints { get; set; } = new();

    /// <summary>
    /// Missing skills or experience relative to the job requirements
    /// </summary>
    public List<string> Gaps { get; set; } = new();

    /// <summary>
    /// Actionable advice items for improving fit and interview readiness
    /// </summary>
    public List<string> Advice { get; set; } = new();

    /// <summary>
    /// Tailored resume content (Markdown)
    /// </summary>
    public string? TailoredResume { get; set; }

    /// <summary>
    /// Tailored cover letter content (Markdown)
    /// </summary>
    public string? TailoredCoverLetter { get; set; }

    /// <summary>
    /// Whether the analysis completed successfully
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Error message if the analysis failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Creates a successful analysis result
    /// </summary>
    public static AiAnalysisResult CreateSuccess(AiAnalysisResultDetails details)
    {
        return new AiAnalysisResult
        {
            MatchScore = details.MatchScore,
            GapAnalysis = details.GapAnalysis,
            MissingSkills = details.MissingSkills,
            StrategicAdvice = details.StrategicAdvice,
            GoodPoints = details.GoodPoints,
            Gaps = details.Gaps,
            Advice = details.Advice,
            TailoredResume = details.TailoredResume,
            TailoredCoverLetter = details.TailoredCoverLetter,
            Success = true
        };
    }

    /// <summary>
    /// Creates a failed analysis result with an error message
    /// </summary>
    public static AiAnalysisResult CreateError(string errorMessage)
    {
        return new AiAnalysisResult
        {
            Success = false,
            ErrorMessage = errorMessage
        };
    }
}

public sealed class AiAnalysisResultDetails
{
    public int MatchScore { get; set; }
    public string GapAnalysis { get; set; } = string.Empty;
    public List<string> MissingSkills { get; set; } = new();
    public string StrategicAdvice { get; set; } = string.Empty;
    public List<string> GoodPoints { get; set; } = new();
    public List<string> Gaps { get; set; } = new();
    public List<string> Advice { get; set; } = new();
    public string? TailoredResume { get; set; }
    public string? TailoredCoverLetter { get; set; }
}
