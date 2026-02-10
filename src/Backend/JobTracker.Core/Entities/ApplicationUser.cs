using JobTracker.Core.Enums;
using Microsoft.AspNetCore.Identity;

namespace JobTracker.Core.Entities;

/// <summary>
/// Custom user entity that extends IdentityUser with application-specific properties.
/// IdentityUser already provides: Id, UserName, Email, PasswordHash, PhoneNumber, etc.
/// We extend it with properties specific to our job tracking application.
/// </summary>
public class ApplicationUser : IdentityUser
{
    // ============================================
    // PROFILE INFORMATION
    // ============================================

    /// <summary>
    /// User's first name for personalization.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// User's last name for personalization.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// URL or path to user's profile picture.
    /// </summary>
    public string? ProfilePictureUrl { get; set; }

    /// <summary>
    /// User's current job title (e.g., "Junior Developer").
    /// </summary>
    public string? CurrentJobTitle { get; set; }

    /// <summary>
    /// Years of professional experience.
    /// </summary>
    public int? YearsOfExperience { get; set; }

    /// <summary>
    /// Brief professional summary or bio.
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Timestamp when the user account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp of the user's last login.
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Indicates if the user registered via external provider (Google, etc.).
    /// </summary>
    public bool IsExternalAccount { get; set; } = false;

    /// <summary>
    /// The external provider name if registered externally (e.g., "Google").
    /// </summary>
    public string? ExternalProvider { get; set; }

    /// <summary>
    /// User's job applications.
    /// </summary>
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    /// <summary>
    /// User's skills (many-to-many relationship).
    /// </summary>
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();

    /// <summary>
    /// User's uploaded documents (CVs, cover letters, etc.).
    /// </summary>
    public ICollection<Document> Documents { get; set; } = new List<Document>();

    /// <summary>
    /// User's current subscription tier.
    /// </summary>
    public SubscriptionTier SubscriptionTier { get; set; } = SubscriptionTier.Operative;

    /// <summary>
    /// User's own OpenAI API key ("Bring Your Own Key" support).
    /// </summary>
    public string? OpenAiApiKey { get; set; }

    /// <summary>
    /// User's chosen AI persona for interactions.
    /// </summary>
    public AiPersona AiPersona { get; set; } = AiPersona.Professional;


    // ============================================
    // HELPER PROPERTIES
    // ============================================

    /// <summary>
    /// Computed property to get full name
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
}
