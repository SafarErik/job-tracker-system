using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Google.GenAI;
using Google.GenAI.Types;
using JobTracker.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Implementation of IAIService using Google Gemini 3 Flash Preview API.
/// Analyzes job descriptions against resumes to provide match scores and insights.
/// </summary>
public class GeminiAIService : IAIService
{
    private readonly Client _client;
    private readonly ILogger<GeminiAIService> _logger;

    /// <summary>
    /// The Gemini model to use for AI operations.
    /// </summary>
    private const string GEMINI_MODEL = "gemini-3-flash-preview";

    private const string ANALYSIS_SYSTEM_PROMPT_TEMPLATE = @"System: You are a career strategist.
Inputs:
Job Description: {0}
User Skills: {1}
User Resume: {2}
Task:
Provide a matchScore (0-100).
Identify 'GoodPoints' (where the user matches).
Identify 'Gaps' (missing skills or experience).
Provide 'StrategicAdvice' for the interview.
Generate a 'TailoredResume' (Markdown format) that optimizes the original resume for this specific job.
Generate a 'CoverLetter' (Markdown format).
Return ONLY a JSON object with these keys: matchScore, goodPoints[], gaps[], advice[], tailoredResume, tailoredCoverLetter.";

    private const string COVER_LETTER_SYSTEM_PROMPT = @"You are a professional career coach. Write a tailored, persuasive cover letter based on the Job Description and Resume provided.
Keep it professional, engaging, and under 300 words. 
Return ONLY the text of the cover letter. No preamble, no commentary, no markdown formatting.";

    private const string RESUME_OPTIMIZE_SYSTEM_PROMPT = @"You are an expert resume writer. Rework the provided Resume to better align with the Job Description. 
Focus on highlighting relevant skills and achievements that match the requirements.
Maintain a professional tone and clear structure.
Return ONLY the reworked resume content. No preamble, no commentary, no markdown formatting.";

    public GeminiAIService(
        IConfiguration configuration,
        ILogger<GeminiAIService> logger)
    {
        var apiKey = configuration["AI:GeminiApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Gemini API key not configured");
        }
        System.Environment.SetEnvironmentVariable("GOOGLE_API_KEY", apiKey);
        _client = new Client();
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

            var systemPrompt = string.Format(ANALYSIS_SYSTEM_PROMPT_TEMPLATE, jobDescription, skillsList, resumeText);
            var userPrompt = "Return the JSON object only.";

            var textResponse = await CallGeminiAsync(systemPrompt, userPrompt);

            if (string.IsNullOrEmpty(textResponse))
            {
                return AiAnalysisResult.CreateError("AI request failed. Verify AI:GeminiApiKey is configured and try again.");
            }

            var cleanedResponse = StripMarkdownCodeBlock(textResponse);

            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var analysisResult = JsonSerializer.Deserialize<GeminiAnalysisResponse>(cleanedResponse, jsonOptions);

            if (analysisResult == null)
            {
                return AiAnalysisResult.CreateError("Failed to parse AI response. Please try again.");
            }

            return AiAnalysisResult.CreateSuccess(new AiAnalysisResultDetails
            {
                MatchScore = Math.Clamp(analysisResult.MatchScore, 0, 100),
                GapAnalysis = analysisResult.GapAnalysis ?? string.Empty,
                MissingSkills = analysisResult.MissingSkills ?? new List<string>(),
                StrategicAdvice = analysisResult.StrategicAdvice ?? string.Empty,
                GoodPoints = analysisResult.GoodPoints ?? new List<string>(),
                Gaps = analysisResult.Gaps ?? new List<string>(),
                Advice = analysisResult.Advice ?? new List<string>(),
                TailoredResume = analysisResult.TailoredResume,
                TailoredCoverLetter = analysisResult.TailoredCoverLetter
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AI analysis");
            return AiAnalysisResult.CreateError("An error occurred during analysis.");
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

        var response = await CallGeminiAsync(COVER_LETTER_SYSTEM_PROMPT, userPrompt);
        return response ?? "Failed to generate cover letter. Please try again.";
    }

    public async Task<string> OptimizeResumeAsync(string jobDescription, string resumeText)
    {
        var userPrompt = $@"## Job Description:
{jobDescription}

## Resume:
{resumeText}

Optimize this resume for the job description.";

        var response = await CallGeminiAsync(RESUME_OPTIMIZE_SYSTEM_PROMPT, userPrompt);
        return response ?? "Failed to optimize resume. Please try again.";
    }

    private async Task<string?> CallGeminiAsync(string systemPrompt, string userPrompt)
    {
        try
        {
            _logger.LogDebug("Calling Gemini API with model: {Model}", GEMINI_MODEL);
            var response = await _client.Models.GenerateContentAsync(GEMINI_MODEL, systemPrompt + "\n\n" + userPrompt);
            if (response?.Candidates?.Count > 0 && response.Candidates[0]?.Content?.Parts?.Count > 0)
            {
                _logger.LogDebug("Gemini API returned successful response");
                return response.Candidates[0].Content.Parts[0].Text;
            }
            _logger.LogWarning("Gemini API returned empty response");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API with model {Model}", GEMINI_MODEL);
            return null;
        }
    }

    /// <summary>
    /// Strips markdown code block wrappers from JSON responses.
    /// Handles formats like: ```json {...} ``` or ```{...}```
    /// </summary>
    private static string StripMarkdownCodeBlock(string text)
    {
        var trimmed = text.Trim();

        // Check for ```json or ``` prefix
        if (trimmed.StartsWith("```"))
        {
            // Find the end of the first line (after ```json or ```)
            var firstNewline = trimmed.IndexOf('\n');
            if (firstNewline > 0)
            {
                trimmed = trimmed[(firstNewline + 1)..];
            }
            else
            {
                // No newline, just strip the ```
                trimmed = trimmed[3..];
            }
        }

        // Strip trailing ```
        if (trimmed.EndsWith("```"))
        {
            trimmed = trimmed[..^3];
        }

        return trimmed.Trim();
    }

    private sealed class GeminiAnalysisResponse
    {
        [JsonPropertyName("matchScore")]
        public int MatchScore { get; set; }

        [JsonPropertyName("gapAnalysis")]
        public string? GapAnalysis { get; set; }

        [JsonPropertyName("missingSkills")]
        public List<string>? MissingSkills { get; set; }

        [JsonPropertyName("strategicAdvice")]
        public string? StrategicAdvice { get; set; }

        [JsonPropertyName("goodPoints")]
        public List<string>? GoodPoints { get; set; }

        [JsonPropertyName("gaps")]
        public List<string>? Gaps { get; set; }

        [JsonPropertyName("advice")]
        public List<string>? Advice { get; set; }

        [JsonPropertyName("tailoredResume")]
        public string? TailoredResume { get; set; }

        [JsonPropertyName("tailoredCoverLetter")]
        public string? TailoredCoverLetter { get; set; }
    }
}
