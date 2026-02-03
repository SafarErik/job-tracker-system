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
    /// <param name="resumeText">The user's resume/CV text content</param>
    /// <returns>Analysis results including match score, gap analysis, and strategic advice</returns>
    Task<AiAnalysisResult> AnalyzeJobAsync(string jobDescription, string resumeText);

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
    public static AiAnalysisResult CreateSuccess(int matchScore, string gapAnalysis, List<string> missingSkills, string strategicAdvice)
    {
        return new AiAnalysisResult
        {
            MatchScore = matchScore,
            GapAnalysis = gapAnalysis,
            MissingSkills = missingSkills,
            StrategicAdvice = strategicAdvice,
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
