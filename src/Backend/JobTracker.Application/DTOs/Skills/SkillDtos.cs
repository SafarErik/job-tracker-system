using System.ComponentModel.DataAnnotations;

namespace JobTracker.Application.DTOs.Skills;

/// <summary>
/// DTO for returning skill data.
/// Skills can belong to users (what they know) or jobs (what's required).
/// </summary>
public class SkillDto
{
    public int Id { get; set; }
    
    /// <summary>
    /// Skill name (e.g., "C#", "Docker", "React")
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional category for grouping (e.g., "Programming Language", "Framework", "DevOps")
    /// </summary>
    public string? Category { get; set; }
}

/// <summary>
/// DTO for creating a new skill.
/// </summary>
public class CreateSkillDto
{
    [Required(ErrorMessage = "Skill name is required")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Skill name must be between 1 and 50 characters")]
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional category for organizing skills
    /// </summary>
    public string? Category { get; set; }
}

/// <summary>
/// DTO for skill matching results.
/// Used when comparing user skills against job requirements.
/// </summary>
public class SkillMatchResultDto
{
    /// <summary>
    /// Skills the user has that match job requirements
    /// </summary>
    public List<SkillDto> MatchedSkills { get; set; } = new();
    
    /// <summary>
    /// Skills required by the job that the user doesn't have
    /// </summary>
    public List<SkillDto> MissingSkills { get; set; } = new();
    
    /// <summary>
    /// Overall match percentage (0-100)
    /// </summary>
    public int MatchPercentage { get; set; }
    
    /// <summary>
    /// Total number of skills required by the job
    /// </summary>
    public int TotalRequiredSkills { get; set; }
}

/// <summary>
/// DTO for user's skill profile.
/// Contains all skills a user has with optional proficiency levels.
/// </summary>
public class UserSkillsDto
{
    /// <summary>
    /// User's ID
    /// </summary>
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// List of skills the user possesses
    /// </summary>
    public List<SkillDto> Skills { get; set; } = new();
    
    /// <summary>
    /// Skills grouped by category for display
    /// </summary>
    public Dictionary<string, List<SkillDto>> SkillsByCategory { get; set; } = new();
}
