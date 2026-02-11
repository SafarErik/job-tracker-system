using System.ComponentModel.DataAnnotations;

namespace JobTracker.Application.DTOs.Companies;

/// <summary>
/// DTO for requesting a company scout/scan via URL.
/// </summary>
public class ScoutRequestDto
{
    [Required(ErrorMessage = "URL is required")]
    [Url(ErrorMessage = "Invalid URL format")]
    public string Url { get; set; } = string.Empty;
}
