using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobTracker.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Implementation of IAIService using Google Gemini 1.5 Flash API.
/// Analyzes job descriptions against resumes to provide match scores and insights.
/// </summary>
public class GeminiAIService : IAIService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GeminiAIService> _logger;

    private const string GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    private const string ANALYSIS_SYSTEM_PROMPT = @"You are an expert HR Tech AI. Analyze the provided Job Description against the Resume.

You MUST return a valid JSON object only, with no additional text, markdown formatting, or code blocks.

The JSON must have exactly these keys:
- matchScore (integer between 0-100 representing the match percentage)
- gapAnalysis (string with detailed analysis of gaps between resume and job requirements)
- missingSkills (array of strings listing specific skills from the job that are missing from the resume)
- strategicAdvice (string with actionable advice for the applicant to improve their chances)

Example response format:
{""matchScore"":75,""gapAnalysis"":""The candidate has strong frontend skills but lacks cloud experience."",""missingSkills"":[""AWS"",""Docker"",""Kubernetes""],""strategicAdvice"":""Focus on highlighting your React experience and consider getting AWS certified.""}";

    private const string COVER_LETTER_SYSTEM_PROMPT = @"You are a professional career coach. Write a tailored, persuasive cover letter based on the Job Description and Resume provided.
Keep it professional, engaging, and under 300 words. 
Return ONLY the text of the cover letter. No preamble, no commentary, no markdown formatting.";

    private const string RESUME_OPTIMIZE_SYSTEM_PROMPT = @"You are an expert resume writer. Rework the provided Resume to better align with the Job Description. 
Focus on highlighting relevant skills and achievements that match the requirements.
Maintain a professional tone and clear structure.
Return ONLY the reworked resume content. No preamble, no commentary, no markdown formatting.";

    public GeminiAIService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GeminiAIService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AiAnalysisResult> AnalyzeJobAsync(string jobDescription, string resumeText)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(jobDescription) || string.IsNullOrWhiteSpace(resumeText))
            {
                return AiAnalysisResult.CreateError("Job description and resume are required for analysis.");
            }

            var userPrompt = $@"## Job Description:
{jobDescription}

## Resume:
{resumeText}

Analyze the above job description against the resume and return your analysis as a JSON object.";

            var textResponse = await CallGeminiAsync(ANALYSIS_SYSTEM_PROMPT, userPrompt);

            if (string.IsNullOrEmpty(textResponse))
            {
                return AiAnalysisResult.CreateError("AI returned an empty response. Please try again.");
            }

            // Strip markdown code block wrappers if present (```json ... ```)
            var cleanedResponse = StripMarkdownCodeBlock(textResponse);

            var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var analysisResult = JsonSerializer.Deserialize<GeminiAnalysisResponse>(cleanedResponse, jsonOptions);

            if (analysisResult == null)
            {
                return AiAnalysisResult.CreateError("Failed to parse AI response. Please try again.");
            }

            return AiAnalysisResult.CreateSuccess(
                matchScore: Math.Clamp(analysisResult.MatchScore, 0, 100),
                gapAnalysis: analysisResult.GapAnalysis ?? string.Empty,
                missingSkills: analysisResult.MissingSkills ?? new List<string>(),
                strategicAdvice: analysisResult.StrategicAdvice ?? string.Empty
            );
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
            var apiKey = _configuration["AI:GeminiApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("Gemini API key is not configured");
                return null;
            }

            var requestBody = new GeminiRequest
            {
                Contents = new[]
                {
                    new GeminiContent
                    {
                        Parts = new[]
                        {
                            new GeminiPart { Text = systemPrompt },
                            new GeminiPart { Text = userPrompt }
                        }
                    }
                },
                GenerationConfig = new GeminiGenerationConfig
                {
                    Temperature = 0.7,
                    MaxOutputTokens = 2048
                }
            };

            var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var requestUrl = $"{GEMINI_API_BASE}?key={apiKey}";
            var response = await _httpClient.PostAsync(requestUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

            return geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API");
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

    #region Gemini API Models

    private class GeminiRequest
    {
        public GeminiContent[] Contents { get; set; } = Array.Empty<GeminiContent>();
        public GeminiGenerationConfig? GenerationConfig { get; set; }
    }

    private class GeminiContent
    {
        public GeminiPart[] Parts { get; set; } = Array.Empty<GeminiPart>();
    }

    private class GeminiPart
    {
        public string Text { get; set; } = string.Empty;
    }

    private class GeminiGenerationConfig
    {
        public double Temperature { get; set; }
        public int MaxOutputTokens { get; set; }
    }

    private class GeminiResponse
    {
        public GeminiCandidate[]? Candidates { get; set; }
    }

    private class GeminiCandidate
    {
        public GeminiContent? Content { get; set; }
    }

    private class GeminiAnalysisResponse
    {
        [JsonPropertyName("matchScore")]
        public int MatchScore { get; set; }

        [JsonPropertyName("gapAnalysis")]
        public string? GapAnalysis { get; set; }

        [JsonPropertyName("missingSkills")]
        public List<string>? MissingSkills { get; set; }

        [JsonPropertyName("strategicAdvice")]
        public string? StrategicAdvice { get; set; }
    }

    #endregion
}
