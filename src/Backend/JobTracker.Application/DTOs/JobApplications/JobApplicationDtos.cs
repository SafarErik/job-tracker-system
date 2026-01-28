using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;

namespace JobTracker.Application.DTOs.JobApplications;

/// <summary>
/// DTO for returning job application data to clients.
/// Contains all information needed for displaying a job application.
/// </summary>
public class JobApplicationDto
{
    public int Id { get; set; }
    
    /// <summary>
    /// The position title (e.g., "Senior Developer")
    /// </summary>
    public string Position { get; set; } = string.Empty;
    
    /// <summary>
    /// URL to the original job posting
    /// </summary>
    public string? JobUrl { get; set; }
    
    /// <summary>
    /// Job description text (for NLP skill extraction)
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// When the application was submitted
    /// </summary>
    public DateTime AppliedAt { get; set; }
    
    /// <summary>
    /// Current status in the application pipeline
    /// </summary>
    public JobApplicationStatus Status { get; set; }

    /// <summary>
    /// Type of employment (e.g., FullTime, Internship)
    /// </summary>
    public JobType JobType { get; set; }

    /// <summary>
    /// Type of workplace (e.g., Remote, OnSite, Hybrid)
    /// </summary>
    public WorkplaceType WorkplaceType { get; set; }

    // ============================================
    // RELATED ENTITY INFORMATION
    // ============================================

    /// <summary>
    /// ID of the company this application is for
    /// </summary>
    public int CompanyId { get; set; }
    
    /// <summary>
    /// Company name - denormalized for easy display
    /// </summary>
    public string? CompanyName { get; set; }

    /// <summary>
    /// ID of the CV/Resume used for this application
    /// </summary>
    public Guid? DocumentId { get; set; }
    
    /// <summary>
    /// Original filename of the CV - denormalized for easy display
    /// </summary>
    public string? DocumentName { get; set; }

    /// <summary>
    /// List of skills required for this position
    /// </summary>
    public List<string> Skills { get; set; } = new();

    /// <summary>
    /// Skill match percentage against user's skills (0-100)
    /// </summary>
    public int MatchScore { get; set; }

    /// <summary>
    /// Priority of this application (Low, Medium, High)
    /// </summary>
    public JobPriority Priority { get; set; }

    /// <summary>
    /// Offered or expected salary (nullable)
    /// </summary>
    public decimal? SalaryOffer { get; set; }
}

/// <summary>
/// DTO for creating a new job application.
/// </summary>
public class CreateJobApplicationDto
{
    [Required(ErrorMessage = "Position is required")]
    public string Position { get; set; } = string.Empty;

    [Required(ErrorMessage = "Company is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Please select a valid company")]
    public int CompanyId { get; set; }

    public string? JobUrl { get; set; }
    
    /// <summary>
    /// Job description - will be analyzed by NLP for skill extraction
    /// </summary>
    public string? Description { get; set; }
    
    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Applied;

    public JobType JobType { get; set; } = JobType.FullTime;

    public WorkplaceType WorkplaceType { get; set; } = WorkplaceType.OnSite;

    public JobPriority Priority { get; set; } = JobPriority.Medium;

    public int MatchScore { get; set; } = 0;

    public decimal? SalaryOffer { get; set; }

    /// <summary>
    /// Reference to the CV/Resume to use for this application
    /// </summary>
    public Guid? DocumentId { get; set; }
}

/// <summary>
/// DTO for updating an existing job application.
/// Supports partial updates - only non-null fields will be updated.
/// </summary>
public class UpdateJobApplicationDto
{
    public string? Position { get; set; }

    public int? CompanyId { get; set; }

    public string? JobUrl { get; set; }

    public string? Description { get; set; }

    /// <summary>
    /// Reference to the CV/Resume document
    /// </summary>
    public Guid? DocumentId { get; set; }

    /// <summary>
    /// Indicates whether DocumentId was explicitly provided in the request.
    /// When true, DocumentId will be updated (even if null to clear the association).
    /// When false, DocumentId will remain unchanged.
    /// </summary>
    public bool DocumentIdProvided { get; set; }

    public JobApplicationStatus? Status { get; set; }

    public JobType? JobType { get; set; }

    public WorkplaceType? WorkplaceType { get; set; }

    public JobPriority? Priority { get; set; }

    public int? MatchScore { get; set; }

    public decimal? SalaryOffer { get; set; }
}
