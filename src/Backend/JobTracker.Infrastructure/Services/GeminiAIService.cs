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

    private const string SYSTEM_PROMPT = @"You are an expert HR Tech AI. Analyze the provided Job Description against the Resume.

You MUST return a valid JSON object only, with no additional text, markdown formatting, or code blocks.

The JSON must have exactly these keys:
- matchScore (integer between 0-100 representing the match percentage)
- gapAnalysis (string with detailed analysis of gaps between resume and job requirements)
- missingSkills (array of strings listing specific skills from the job that are missing from the resume)
- strategicAdvice (string with actionable advice for the applicant to improve their chances)

Example response format:
{""matchScore"":75,""gapAnalysis"":""The candidate has strong frontend skills but lacks cloud experience."",""missingSkills"":[""AWS"",""Docker"",""Kubernetes""],""strategicAdvice"":""Focus on highlighting your React experience and consider getting AWS certified.""}";

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
            var apiKey = _configuration["AI:GeminiApiKey"];

            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("Gemini API key is not configured");
                return AiAnalysisResult.CreateError("AI service is not configured. Please contact support.");
            }

            if (string.IsNullOrWhiteSpace(jobDescription))
            {
                return AiAnalysisResult.CreateError("Job description is required for analysis.");
            }

            if (string.IsNullOrWhiteSpace(resumeText))
            {
                return AiAnalysisResult.CreateError("Resume text is required for analysis. Please upload a Master Resume.");
            }

            var userPrompt = $@"## Job Description:
{jobDescription}

## Resume:
{resumeText}

Analyze the above job description against the resume and return your analysis as a JSON object.";

            var requestBody = new GeminiRequest
            {
                Contents = new[]
                {
                    new GeminiContent
                    {
                        Parts = new[]
                        {
                            new GeminiPart { Text = SYSTEM_PROMPT },
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

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            var json = JsonSerializer.Serialize(requestBody, jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var requestUrl = $"{GEMINI_API_BASE}?key={apiKey}";
            var response = await _httpClient.PostAsync(requestUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                return AiAnalysisResult.CreateError($"AI analysis failed: {response.StatusCode}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseBody, jsonOptions);

            var textResponse = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            if (string.IsNullOrEmpty(textResponse))
            {
                _logger.LogError("Empty response from Gemini API");
                return AiAnalysisResult.CreateError("AI returned an empty response. Please try again.");
            }

            // Strip markdown code block wrappers if present (```json ... ```)
            var cleanedResponse = StripMarkdownCodeBlock(textResponse);

            var analysisResult = JsonSerializer.Deserialize<GeminiAnalysisResponse>(cleanedResponse, jsonOptions);

            if (analysisResult == null)
            {
                _logger.LogError("Failed to parse Gemini response: {Response}", textResponse);
                return AiAnalysisResult.CreateError("Failed to parse AI response. Please try again.");
            }

            return AiAnalysisResult.CreateSuccess(
                matchScore: Math.Clamp(analysisResult.MatchScore, 0, 100),
                gapAnalysis: analysisResult.GapAnalysis ?? string.Empty,
                missingSkills: analysisResult.MissingSkills ?? new List<string>(),
                strategicAdvice: analysisResult.StrategicAdvice ?? string.Empty
            );
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "JSON parsing error in Gemini response");
            return AiAnalysisResult.CreateError("Failed to parse AI response. Please try again.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error calling Gemini API");
            return AiAnalysisResult.CreateError("Failed to connect to AI service. Please try again later.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in AI analysis");
            return AiAnalysisResult.CreateError("An unexpected error occurred during analysis.");
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
