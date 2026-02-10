using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;

namespace JobTracker.Application.DTOs.Companies;

/// <summary>
/// DTO for returning company data in list views.
/// Contains summary information for quick overview.
/// </summary>
public class CompanyDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Website { get; set; }

    public string? Address { get; set; }

    public string? LogoUrl { get; set; }

    public string? HqLocation { get; set; }

    public string? Description { get; set; }

    public int CompatibilityScore { get; set; }

    /// <summary>
    /// Total number of applications submitted to this company
    /// </summary>
    public int TotalApplications { get; set; }

    public string? Industry { get; set; }

    public List<string> TechStack { get; set; } = new();

    /// <summary>
    /// Company Priority (TopTier, MidTier, LowTier, Archived)
    /// </summary>
    public CompanyPriority Priority { get; set; } = CompanyPriority.MidTier;

    /// <summary>
    /// Recent job applications for this company
    /// </summary>
    public List<JobApplicationHistoryDto> RecentApplications { get; set; } = new();
}

/// <summary>
/// DTO for detailed company view including application history.
/// Used when viewing a single company's full details.
/// </summary>
public class CompanyDetailDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Website { get; set; }

    public string? Address { get; set; }

    public string? LogoUrl { get; set; }

    public string? HqLocation { get; set; }

    public string? Description { get; set; }

    public int CompatibilityScore { get; set; }

    /// <summary>
    /// Total number of applications to this company
    /// </summary>
    public int TotalApplications { get; set; }

    public string? Industry { get; set; }

    public List<string> TechStack { get; set; } = new();

    /// <summary>
    /// Company Priority (TopTier, MidTier, LowTier, Archived)
    /// </summary>
    public CompanyPriority Priority { get; set; } = CompanyPriority.MidTier;

    /// <summary>
    /// History of all applications to this company
    /// </summary>
    public List<JobApplicationHistoryDto> ApplicationHistory { get; set; } = new();

    /// <summary>
    /// List of points of contact at the company
    /// </summary>
    public List<CompanyContactDto> Contacts { get; set; } = new();
}

/// <summary>
/// Simplified job application info for company history view.
/// </summary>
public class JobApplicationHistoryDto
{
    public Guid Id { get; set; }

    public string Position { get; set; } = string.Empty;

    public DateTime AppliedAt { get; set; }

    /// <summary>
    /// Status as string for display purposes
    /// </summary>
    public string Status { get; set; } = string.Empty;

    public decimal? SalaryOffer { get; set; }
}

/// <summary>
/// DTO for creating a new company.
/// </summary>
public class CreateCompanyDto
{
    [Required(ErrorMessage = "Company name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Company name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Url(ErrorMessage = "Invalid website URL format")]
    public string? Website { get; set; }

    public string? Address { get; set; }

    [Url(ErrorMessage = "Invalid logo URL format")]
    public string? LogoUrl { get; set; }

    [StringLength(150, ErrorMessage = "HQ Location cannot exceed 150 characters")]
    public string? HqLocation { get; set; }

    public string? Description { get; set; }

    public string? Industry { get; set; }

    public List<string>? TechStack { get; set; }

    [EnumDataType(typeof(CompanyPriority))]
    public CompanyPriority Priority { get; set; } = CompanyPriority.MidTier;

    /// <summary>
    /// Optional list of contacts to add during creation
    /// </summary>
    public List<CompanyContactDto>? Contacts { get; set; }
}

/// <summary>
/// DTO for updating an existing company.
/// Supports partial updates.
/// </summary>
public class UpdateCompanyDto
{
    [StringLength(100, MinimumLength = 2)]
    public string? Name { get; set; }

    [Url(ErrorMessage = "Invalid website URL format")]
    public string? Website { get; set; }

    public string? Address { get; set; }

    [Url(ErrorMessage = "Invalid logo URL format")]
    public string? LogoUrl { get; set; }

    [StringLength(150, ErrorMessage = "HQ Location cannot exceed 150 characters")]
    public string? HqLocation { get; set; }

    public string? Description { get; set; }

    public string? Industry { get; set; }

    public List<string>? TechStack { get; set; }

    [EnumDataType(typeof(CompanyPriority))]
    public CompanyPriority? Priority { get; set; }

    /// <summary>
    /// Optional list of contacts to update or add
    /// </summary>
    public List<CompanyContactDto>? Contacts { get; set; }
}

/// <summary>
/// DTO for returning company contact information.
/// </summary>
public class CompanyContactDto
{
    public Guid Id { get; set; }

    [Required]
    public string Name { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [Url]
    public string? LinkedIn { get; set; }

    public string? Role { get; set; }
}
