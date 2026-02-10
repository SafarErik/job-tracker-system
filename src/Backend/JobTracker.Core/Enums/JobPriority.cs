namespace JobTracker.Core.Enums;

/// <summary>
/// Priority of a specific job application.
/// </summary>
public enum JobPriority
{
    /// <summary>Standard priority.</summary>
    Low,
    /// <summary>Important application.</summary>
    Medium,
    /// <summary>Top priority application requiring immediate attention.</summary>
    High
}
