namespace JobTracker.Core.Interfaces;

/// <summary>
/// Service for gathering intelligence about companies using web scraping and AI.
/// </summary>
public interface ICompanyIntelligenceService
{
    /// <summary>
    /// Scouts a company by its URL, fetching website content and analyzing it with AI.
    /// </summary>
    /// <param name="url">The corporate website URL.</param>
    /// <returns>Scouted company details.</returns>
    Task<ScoutedCompanyDto> ScoutCompanyAsync(string url);
}

/// <summary>
/// DTO for AI-scouted company information.
/// </summary>
public class ScoutedCompanyDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? Industry { get; set; }
    public string? Description { get; set; }
    public string? HqLocation { get; set; }
    public List<string> TechStack { get; set; } = new();
    public int CompatibilityScore { get; set; }
    public List<string> Risks { get; set; } = new();

    /// <summary>
    /// Whether the scouting was successful.
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// Error message if scouting failed.
    /// </summary>
    public string? ErrorMessage { get; set; }

    public static ScoutedCompanyDto Error(string message) => new() { Success = false, ErrorMessage = message };
}
