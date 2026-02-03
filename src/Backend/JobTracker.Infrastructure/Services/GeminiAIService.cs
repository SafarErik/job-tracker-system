using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Google.GenAI;
using Google.GenAI.Types;
using JobTracker.Core.Interfaces;
using JobTracker.Core.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Implementation of IAIService using Google Gemini 3 Flash Preview API.
/// Analyzes job descriptions against resumes to provide match scores and insights.
/// </summary>
public partial class GeminiAIService : IAIService
{
    private readonly Client _client;
    private readonly ILogger<GeminiAIService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    // Regex to find JSON content within markdown code blocks or plain text
    // Matches ```json? ... ``` or just { ... }
    [GeneratedRegex(@"```(?:json)?\s*(.*?)```", RegexOptions.Singleline | RegexOptions.IgnoreCase)]
    private static partial Regex JsonBlockRegex();

    private static readonly Regex _jsonBlockRegex = JsonBlockRegex();

    public GeminiAIService(
        IConfiguration configuration,
        ILogger<GeminiAIService> logger)
    {
        var apiKey = configuration["AI:GeminiApiKey"];

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API key not configured. Please add 'AI:GeminiApiKey' to your configuration.");
        }

        _client = new Client(apiKey: apiKey);
        _logger = logger;
    }

    public async Task<AiAnalysisResult> AnalyzeJobAsync(string jobDescription, string skillsList, string resumeText)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(jobDescription) || string.IsNullOrWhiteSpace(resumeText))
            {
                return AiAnalysisResult.CreateError("Job description and resume are required for analysis.");
            }

            var systemPrompt = string.Format(AiPrompts.AnalysisSystemPrompt, jobDescription, skillsList, resumeText);
            var userPrompt = "Return only the JSON object, starting with { and ending with }.";

            var textResponse = await CallGeminiAsync(systemPrompt, userPrompt);

            if (string.IsNullOrEmpty(textResponse))
            {
                return AiAnalysisResult.CreateError("AI request failed. The service provided an empty response.");
            }

            var cleanedResponse = ExtractJson(textResponse);

            var analysisResult = JsonSerializer.Deserialize<GeminiAnalysisResponse>(cleanedResponse, _jsonOptions);

            if (analysisResult == null)
            {
                return AiAnalysisResult.CreateError("Failed to parse AI response. The model returned invalid data.");
            }

            var result = AiAnalysisResult.SuccessResult();
            result.MatchScore = Math.Clamp(analysisResult.MatchScore, 0, 100);
            result.GapAnalysis = analysisResult.GapAnalysis ?? "No gap analysis provided.";
            result.MissingSkills = analysisResult.MissingSkills ?? new List<string>();
            result.StrategicAdvice = analysisResult.StrategicAdvice ?? "No strategic advice provided.";
            result.GoodPoints = analysisResult.GoodPoints ?? new List<string>();
            result.Gaps = analysisResult.Gaps ?? new List<string>();
            result.Advice = analysisResult.Advice ?? new List<string>();
            result.TailoredResume = analysisResult.TailoredResume;
            result.TailoredCoverLetter = analysisResult.TailoredCoverLetter;

            return result;
        }
        catch (JsonException jsonEx)
        {
            _logger.LogError(jsonEx, "Failed to deserialize JSON from Gemini response");
            return AiAnalysisResult.CreateError("The AI returned a response that could not be parsed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in AI analysis");
            return AiAnalysisResult.CreateError("An unexpected system error occurred during analysis.");
        }
    }

    public async Task<string> GenerateCoverLetterAsync(string jobDescription, string resumeText, string companyName, string position)
    {
        var userPrompt = $@"## Company: {companyName}
## Position: {position}

## Job Description:
{jobDescription}

## Resume:
{resumeText}

Write a professional cover letter for this position.";

        var response = await CallGeminiAsync(AiPrompts.CoverLetterSystemPrompt, userPrompt);
        return response ?? "Failed to generate cover letter. Please try again.";
    }

    public async Task<string> OptimizeResumeAsync(string jobDescription, string resumeText)
    {
        var userPrompt = $@"## Job Description:
{jobDescription}

## Resume:
{resumeText}

Optimize this resume for the job description.";

        var response = await CallGeminiAsync(AiPrompts.ResumeOptimizeSystemPrompt, userPrompt);
        return response ?? "Failed to optimize resume. Please try again.";
    }

    private async Task<string?> CallGeminiAsync(string systemPrompt, string userPrompt)
    {
        try
        {
            _logger.LogDebug("Calling Gemini API ({Model})", AiPrompts.GeminiModel);

            var response = await _client.Models.GenerateContentAsync(
                AiPrompts.GeminiModel,
                systemPrompt + "\n\n" + userPrompt
            );

            var candidate = response?.Candidates?.FirstOrDefault();
            var part = candidate?.Content?.Parts?.FirstOrDefault();

            if (part?.Text != null)
            {
                return part.Text;
            }

            _logger.LogWarning("Gemini API call succeeded but returned no content parts.");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API: {Message}", ex.Message);
            return null;
        }
    }

    /// <summary>
    /// Robustly extracts JSON content from a potential Markdown response.
    /// </summary>
    private static string ExtractJson(string text)
    {
        var match = _jsonBlockRegex.Match(text);
        if (match.Success)
        {
            return match.Groups[1].Value.Trim();
        }

        // If no code block, assume the whole text is JSON but trim whitespace
        return text.Trim();
    }

    private sealed class GeminiAnalysisResponse
    {
        public int MatchScore { get; set; }
        public string? GapAnalysis { get; set; }
        public List<string>? MissingSkills { get; set; }
        public string? StrategicAdvice { get; set; }
        public List<string>? GoodPoints { get; set; }
        public List<string>? Gaps { get; set; }
        public List<string>? Advice { get; set; }
        public string? TailoredResume { get; set; }
        public string? TailoredCoverLetter { get; set; }
    }
}
