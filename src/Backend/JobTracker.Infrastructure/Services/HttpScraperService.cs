using System.Net.Http.Json;
using System.Text.Json;
using JobTracker.Core.Interfaces;
using JobTracker.Core.Exceptions;
using Microsoft.Extensions.Logging;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Implementation of IScraperService that communicates with the Python FastAPI microservice.
/// </summary>
public class HttpScraperService : IScraperService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<HttpScraperService> _logger;

    public HttpScraperService(HttpClient httpClient, ILogger<HttpScraperService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> FetchPageContentAsync(string url)
    {
        try
        {
            _logger.LogInformation("Requesting crawl for URL: {Url}", url);

            var request = new { url };
            var response = await _httpClient.PostAsJsonAsync("/crawl", request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Scraper service returned error: {StatusCode}. Content: {Content}", response.StatusCode, errorContent);
                throw new ExternalServiceException($"Scraper service failed with status {response.StatusCode}", "ScraperService", (int)response.StatusCode);
            }

            var result = await response.Content.ReadFromJsonAsync<ScraperResponse>();

            if (result == null || !result.Success)
            {
                var error = result?.Error ?? "Unknown error in scraper service";
                _logger.LogWarning("Scraper service indicated failure: {Error}", error);
                throw new ExternalServiceException(error, "ScraperService");
            }

            _logger.LogInformation("Successfully fetched content for URL: {Url}. Length: {Length}", url, result.Markdown?.Length ?? 0);
            return result.Markdown ?? string.Empty;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to connect to Scraper service at {BaseUrl}", _httpClient.BaseAddress);
            throw new ExternalServiceException("Could not reach Scraper service", "ScraperService", ex);
        }
    }

    private class ScraperResponse
    {
        public bool Success { get; set; }
        public string? Markdown { get; set; }
        public string? Error { get; set; }
    }
}
