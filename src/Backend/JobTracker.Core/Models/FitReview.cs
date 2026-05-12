namespace JobTracker.Core.Models;

/// <summary>
/// Structured AI review for a job application fit analysis.
/// Stored as JSON on JobApplication and exposed to the frontend as a typed contract.
/// </summary>
public class FitReview
{
    public string GeneratedAt { get; set; } = DateTimeOffset.UtcNow.ToString("O");
    public string SourceHash { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public string ExecutiveSummary { get; set; } = string.Empty;
    public RoleBrief RoleBrief { get; set; } = new();
    public List<FitKeySignal> KeySignals { get; set; } = new();
    public List<FitGap> Gaps { get; set; } = new();
    public List<string> NextActions { get; set; } = new();
    public string FullReviewMarkdown { get; set; } = string.Empty;
}

public class RoleBrief
{
    public List<string> Overview { get; set; } = new();
    public List<string> Responsibilities { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public List<string> Keywords { get; set; } = new();
}

public class FitKeySignal
{
    public string Label { get; set; } = string.Empty;
    public string Evidence { get; set; } = string.Empty;
    public string Type { get; set; } = FitSignalTypes.Neutral;
}

public class FitGap
{
    public string Id { get; set; } = string.Empty;
    public string Skill { get; set; } = string.Empty;
    public string WhyItMatters { get; set; } = string.Empty;
    public string CurrentEvidence { get; set; } = string.Empty;
    public string Priority { get; set; } = FitGapPriorities.Medium;
    public int EstimatedScoreGain { get; set; }
    public FitLearningPlan LearningPlan { get; set; } = new();
}

public class FitLearningPlan
{
    public List<string> Topics { get; set; } = new();
    public List<string> PracticeTasks { get; set; } = new();
    public List<string> SearchQueries { get; set; } = new();
}

public class RefinedJobBriefResult
{
    public string Description { get; set; } = string.Empty;
    public RoleBrief RoleBrief { get; set; } = new();
    public List<string> Changes { get; set; } = new();
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }

    public static RefinedJobBriefResult CreateError(string errorMessage) => new()
    {
        Success = false,
        ErrorMessage = errorMessage
    };
}

public static class FitSignalTypes
{
    public const string Strength = "strength";
    public const string Risk = "risk";
    public const string Neutral = "neutral";
}

public static class FitGapPriorities
{
    public const string High = "high";
    public const string Medium = "medium";
    public const string Low = "low";
}
