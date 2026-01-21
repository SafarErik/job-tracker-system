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
    /// User's first name for personalization
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// User's last name for personalization
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// URL or path to user's profile picture
    /// Can be populated from Google OAuth or uploaded manually
    /// </summary>
    public string? ProfilePictureUrl { get; set; }

    // ============================================
    // PROFESSIONAL INFORMATION
    // ============================================

    /// <summary>
    /// User's current job title (e.g., "Junior Developer", "DevOps Engineer")
    /// Useful for matching with job applications
    /// </summary>
    public string? CurrentJobTitle { get; set; }

    /// <summary>
    /// Years of professional experience
    /// Can be used for job matching algorithms
    /// </summary>
    public int? YearsOfExperience { get; set; }

    /// <summary>
    /// Brief professional summary or bio
    /// </summary>
    public string? Bio { get; set; }

    // ============================================
    // ACCOUNT METADATA
    // ============================================

    /// <summary>
    /// Timestamp when the user account was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp of the user's last login
    /// Useful for analytics and security
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Indicates if the user registered via external provider (Google, etc.)
    /// </summary>
    public bool IsExternalAccount { get; set; } = false;

    /// <summary>
    /// The external provider name if registered externally (e.g., "Google")
    /// </summary>
    public string? ExternalProvider { get; set; }

    // ============================================
    // NAVIGATION PROPERTIES
    // ============================================

    /// <summary>
    /// User's job applications - one user can have many applications
    /// This enables tracking all job applications for a specific user
    /// </summary>
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    /// <summary>
    /// User's skills - many-to-many relationship
    /// These are the skills the user possesses, which can be compared
    /// against job requirements extracted via NLP (spaCy)
    /// </summary>
    public ICollection<Skill> Skills { get; set; } = new List<Skill>();

    /// <summary>
    /// User's uploaded documents (CVs, cover letters, etc.)
    /// </summary>
    public ICollection<Document> Documents { get; set; } = new List<Document>();

    // ============================================
    // HELPER PROPERTIES
    // ============================================

    /// <summary>
    /// Computed property to get full name
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
}
