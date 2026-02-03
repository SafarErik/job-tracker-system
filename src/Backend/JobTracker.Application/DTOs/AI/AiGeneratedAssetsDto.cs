namespace JobTracker.Application.DTOs.AI;

/// <summary>
/// DTO for AI-generated tailored assets (resume + cover letter) and analysis summaries.
/// </summary>
public class AiGeneratedAssetsDto
{
    public int MatchScore { get; set; }
    public List<string> GoodPoints { get; set; } = new();
    public List<string> Gaps { get; set; } = new();
    public List<string> Advice { get; set; } = new();
    public string AiFeedback { get; set; } = string.Empty;
    public string TailoredResume { get; set; } = string.Empty;
    public string TailoredCoverLetter { get; set; } = string.Empty;
}
