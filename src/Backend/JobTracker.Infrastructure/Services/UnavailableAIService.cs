using JobTracker.Core.Interfaces;
using JobTracker.Core.Models;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Core-safe AI service used when no private guidance provider is configured.
/// </summary>
public class UnavailableAIService : IAIService
{
    private const string UnavailableMessage =
        "Vadis Guidance is not configured. Configure AI:GeminiApiKey to enable guidance features.";

    public bool IsConfigured => false;

    public string ProviderName => "Unavailable";

    public Task<AiAnalysisResult> AnalyzeJobAsync(string jobDescription, string skillsList, string resumeText) =>
        Task.FromResult(AiAnalysisResult.CreateError(UnavailableMessage));

    public Task<RefinedJobBriefResult> RefineJobBriefAsync(string jobDescription, string companyName, string position) =>
        Task.FromResult(RefinedJobBriefResult.CreateError(UnavailableMessage));

    public Task<string> GenerateCoverLetterAsync(string jobDescription, string resumeText, string companyName, string position) =>
        Task.FromResult(UnavailableMessage);

    public Task<string> OptimizeResumeAsync(string jobDescription, string resumeText) =>
        Task.FromResult(UnavailableMessage);

    public Task<string> GenerateContentAsync(string systemPrompt, string userPrompt, bool useJsonMode = false) =>
        Task.FromResult(string.Empty);
}
