namespace JobTracker.Core.Entities;

/// <summary>
/// Represents a professional skill (e.g., "C#", "React", "Docker").
/// Skills can be associated with both users (what they know) and
/// job applications (what's required). This enables skill matching
/// between candidates and job requirements.
/// </summary>
public class Skill
{
    public int Id { get; set; }

    /// <summary>
    /// The skill name (e.g., "C#", "Python", "Kubernetes")
    /// Should be normalized for consistent matching
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Normalized name for case-insensitive uniqueness constraint
    /// </summary>
    public string NormalizedName { get; set; } = string.Empty;

    /// <summary>
    /// Optional category for grouping skills
    /// (e.g., "Programming Language", "Framework", "DevOps")
    /// </summary>
    public string? Category { get; set; }

    // ============================================
    // NAVIGATION PROPERTIES (MANY-TO-MANY)
    // ============================================

    /// <summary>
    /// Job applications that require this skill.
    /// Populated via NLP extraction from job descriptions.
    /// </summary>
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    /// <summary>
    /// Users who possess this skill.
    /// Used for matching users to job requirements.
    /// </summary>
    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
}