using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;

/// <summary>
/// Represents a job application submitted by a user to a company.
/// This is a core entity that tracks the entire job application lifecycle.
/// </summary>
public class JobApplication
{
    // ============================================
    // PRIMARY KEY
    // ============================================

    public Guid Id { get; set; }

    // ============================================
    // USER RELATIONSHIP (OWNER)
    // ============================================

    /// <summary>
    /// Foreign key to the user who owns this job application.
    /// Every job application must belong to a user.
    /// Using string because IdentityUser uses string for Id by default.
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// Navigation property to the user who created this application.
    /// </summary>
    public ApplicationUser? User { get; set; }

    // ============================================
    // JOB DETAILS
    // ============================================

    /// <summary>
    /// The position title (e.g., "Junior Developer", "Senior DevOps Engineer")
    /// </summary>
    public required string Position { get; set; }

    /// <summary>
    /// URL to the original job posting
    /// </summary>
    public string? JobUrl { get; set; }

    /// <summary>
    /// Full job description text.
    /// This will be analyzed by an LLM
    /// </summary>
    public string? Description { get; set; }

    public string? GeneratedCoverLetter { get; set; }

    public string? AiFeedback { get; set; }

    // ============================================
    // APPLICATION METADATA
    // ============================================

    /// <summary>
    /// When the user applied to this position
    /// </summary>
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Current status in the application pipeline
    /// </summary>
    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Applied;

    /// <summary>
    /// Type of employment (Full-time, Internship, etc.)
    /// </summary>
    public JobType JobType { get; set; } = JobType.FullTime;

    /// <summary>
    /// Type of workplace (On-site, Remote, Hybrid)
    /// </summary>
    public WorkplaceType WorkplaceType { get; set; } = WorkplaceType.OnSite;

    /// <summary>
    /// Priority of this application (Low, Medium, High)
    /// </summary>
    public JobPriority Priority { get; set; } = JobPriority.Medium;

    /// <summary>
    /// AI computed match score (0-100)
    /// </summary>
    public int MatchScore { get; set; } = 0;

    /// <summary>
    /// Offered or expected salary (nullable)
    /// </summary>
    public decimal? SalaryOffer { get; set; }

    // ============================================
    // COMPANY RELATIONSHIP
    // ============================================

    /// <summary>
    /// Foreign key to the company
    /// </summary>
    public Guid CompanyId { get; set; }

    /// <summary>
    /// Navigation property - the company this application is for
    /// </summary>
    public Company? Company { get; set; }

    // ============================================
    // CONTACT RELATIONSHIP
    // ============================================

    /// <summary>
    /// The primary contact person for this specific job application
    /// </summary>
    public Guid? PrimaryContactId { get; set; }

    /// <summary>
    /// Navigation property to the primary contact
    /// </summary>
    public CompanyContact? PrimaryContact { get; set; }

    // ============================================
    // DOCUMENT RELATIONSHIP
    // ============================================

    /// <summary>
    /// Foreign key to the CV/Resume used for this application (optional)
    /// </summary>
    public Guid? DocumentId { get; set; }

    /// <summary>
    /// Navigation property to the document (CV) used
    /// </summary>
    public Document? Document { get; set; }

    // ============================================
    // SKILLS RELATIONSHIP (MANY-TO-MANY)
    // ============================================

    /// <summary>
    /// Skills required for this job position.
    /// These can be extracted from the Description using NLP (spaCy).
    /// Compared against user's skills for match percentage calculation.
    /// </summary>
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}