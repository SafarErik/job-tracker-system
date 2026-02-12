using System.ComponentModel.DataAnnotations;

namespace JobTracker.Core.Entities;

/// <summary>
/// Represents a professional skill (e.g., "C#", "React", "Docker").
/// Skills can be associated with both users (what they know) and
/// job applications (what's required). This enables skill matching
/// between candidates and job requirements.
/// </summary>
public class Skill
{
    /// <summary>
    /// Unique identifier for the skill.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The skill name (e.g., "C#", "Python", "Kubernetes").
    /// Should be normalized for consistent matching.
    /// </summary>
    [StringLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Normalized name for case-insensitive uniqueness constraint.
    /// </summary>
    [StringLength(100)]
    public string NormalizedName { get; set; } = string.Empty;

    /// <summary>
    /// Optional category for grouping skills (e.g., "Programming Language", "Framework").
    /// </summary>
    [StringLength(50)]
    public string? Category { get; set; }

    /// <summary>
    /// Job applications that require this skill.
    /// </summary>
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    /// <summary>
    /// Users who possess this skill.
    /// </summary>
    public ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();

    /// <summary>
    /// Companies associated with this skill (e.g. through their tech stack).
    /// </summary>
    public ICollection<Company> Companies { get; set; } = new List<Company>();
}