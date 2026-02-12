namespace JobTracker.Core.Enums;

/// <summary>
/// Defines the type of employment for a job position.
/// </summary>
public enum JobType
{
    /// <summary>
    /// Standard permanent employment.
    /// </summary>
    FullTime,
    /// <summary>
    /// Reduced hours employment.
    /// </summary>
    PartTime,
    /// <summary>
    /// Temporary position for students or career starters.
    /// </summary>
    Internship,
    /// <summary>
    /// Fixed-term contract basis.
    /// </summary>
    Contract,
    /// <summary>
    /// Project-based self-employment.
    /// </summary>
    Freelance
}
