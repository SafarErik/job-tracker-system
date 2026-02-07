namespace JobTracker.Application.DTOs.AI;

/// <summary>
/// DTO for returning AI analysis results through the API.
/// Maps from Core.AiAnalysisResult for external consumption.
/// </summary>
public class AiAnalysisResultDto
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
    /// Strategic advice for the applicant
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
}
