using System.ComponentModel.DataAnnotations;

namespace JobTracker.Application.DTOs.Companies;

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
