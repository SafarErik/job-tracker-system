namespace JobTracker.Core.Enums;

/// <summary>
/// Defines the physical work arrangement for a job.
/// </summary>
public enum WorkplaceType
{
    /// <summary>Work performed from the company office.</summary>
    OnSite,
    /// <summary>Work performed remotely from home or anywhere.</summary>
    Remote,
    /// <summary>A mix of office and remote work.</summary>
    Hybrid
}
