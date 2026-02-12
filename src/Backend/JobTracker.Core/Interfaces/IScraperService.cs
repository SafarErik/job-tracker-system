namespace JobTracker.Core.Interfaces;

/// <summary>
/// Interface for web scraping services.
/// </summary>
public interface IScraperService
{
    /// <summary>
    /// Fetches the content of a web page and returns it as Markdown.
    /// </summary>
    /// <param name="url">The URL to scrape.</param>
    /// <returns>Cleaned Markdown content of the page.</returns>
    Task<string> FetchPageContentAsync(string url);
}
