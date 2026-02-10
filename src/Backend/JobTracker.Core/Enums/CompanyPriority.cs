namespace JobTracker.Core.Enums;

/// <summary>
/// User-defined priority for a company.
/// </summary>
public enum CompanyPriority
{
    /// <summary>Top target, "Dream" companies.</summary>
    TopTier = 1,

    /// <summary>Solid options, good for regular applications.</summary>
    MidTier = 2,

    /// <summary>Safety or backup options.</summary>
    LowTier = 3,

    /// <summary>No longer active or interested.</summary>
    Archived = 99
}