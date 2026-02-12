using System.Text.Json;
using JobTracker.Core.Constants;
using JobTracker.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace JobTracker.Application.Services;

/// <summary>
/// Service for gathering intelligence about companies using web scraping and AI.
/// </summary>
public class CompanyIntelligenceService : ICompanyIntelligenceService
{
    private readonly IScraperService _scraperService;
    private readonly IAIService _aiService;
    private readonly ILogger<CompanyIntelligenceService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public CompanyIntelligenceService(
        IScraperService scraperService,
        IAIService aiService,
        ILogger<CompanyIntelligenceService> logger)
    {
        _scraperService = scraperService;
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<ScoutedCompanyDto> ScoutCompanyAsync(string url)
    {
        try
        {
            string? markdown = null;
            try
            {
                markdown = await _scraperService.FetchPageContentAsync(url);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Scraper failed for {Url}. Falling back to AI-only analysis of the URL.", url);
            }

            var systemPrompt = AiPrompts.CompanyAnalysisPrompt;
            var userPrompt = string.IsNullOrEmpty(markdown)
                ? $"Analyze this company based on its URL: {url}"
                : $"Analyze this company based on its website content:\n\n{markdown}";

            _logger.LogInformation("Requesting AI analysis for company at {Url} (Scraped: {IsScraped})", url, !string.IsNullOrEmpty(markdown));

            var jsonResponse = await _aiService.GenerateContentAsync(systemPrompt, userPrompt, useJsonMode: true);

            if (string.IsNullOrWhiteSpace(jsonResponse))
            {
                return ScoutedCompanyDto.Error("AI provided an empty response for the company analysis.");
            }

            var scoutedData = JsonSerializer.Deserialize<ScoutedCompanyDto>(jsonResponse, _jsonOptions);

            if (scoutedData == null)
            {
                return ScoutedCompanyDto.Error("Failed to parse the AI's company analysis response.");
            }

            scoutedData.Success = true;
            return scoutedData;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize company intelligence JSON for {Url}", url);
            return ScoutedCompanyDto.Error("The AI returned a response that could not be parsed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error scouting company at {Url}", url);
            return ScoutedCompanyDto.Error("An internal error occurred while scouting the company.");
        }
    }
}
