namespace JobTracker.Core.Enums;

/// <summary>
/// Defines the specific AI personality used for generating feedback and insights.
/// </summary>
public enum AiPersona
{
    /// <summary>Balanced, formal, and objective.</summary>
    Professional,

    /// <summary>Direct, focused on keywords and ATS optimization.</summary>
    Recruiter,

    /// <summary>Encouraging, providing career advice and growth tips.</summary>
    Mentor,

    /// <summary>Analytical, focused on long-term career moves and negotiation.</summary>
    Strategist
}