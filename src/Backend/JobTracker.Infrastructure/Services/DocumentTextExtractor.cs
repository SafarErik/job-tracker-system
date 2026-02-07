using JobTracker.Core.Interfaces;
using Microsoft.Extensions.Logging;
using UglyToad.PdfPig;
using System.Text;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Implementation of IDocumentTextExtractor for PDF files using PdfPig.
/// </summary>
public class DocumentTextExtractor : IDocumentTextExtractor
{
    private readonly ILogger<DocumentTextExtractor> _logger;

    public DocumentTextExtractor(ILogger<DocumentTextExtractor> logger)
    {
        _logger = logger;
    }

    public async Task<string> ExtractTextAsync(string filePath)
    {
        if (string.IsNullOrEmpty(filePath))
            return string.Empty;

        if (!File.Exists(filePath))
        {
            _logger.LogWarning("File not found for extraction: {FilePath}", filePath);
            return string.Empty;
        }

        var extension = Path.GetExtension(filePath).ToLowerInvariant();

        try
        {
            if (extension == ".pdf")
            {
                return await ExtractTextFromPdfAsync(filePath);
            }

            // DOC/DOCX extraction is a placeholder for now - requires different libraries
            _logger.LogWarning("Text extraction for {Extension} is not yet implemented", extension);
            return string.Empty;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting text from {FilePath}", filePath);
            return string.Empty;
        }
    }

    private Task<string> ExtractTextFromPdfAsync(string filePath)
    {
        // PdfPig reading is synchronous, wrapping in Task for consistency with interface
        return Task.Run(() =>
        {
            var textBuilder = new StringBuilder();

            using (var document = PdfDocument.Open(filePath))
            {
                foreach (var page in document.GetPages())
                {
                    var pageText = page.Text;
                    if (!string.IsNullOrWhiteSpace(pageText))
                    {
                        textBuilder.AppendLine(pageText);
                    }
                }
            }

            return textBuilder.ToString();
        });
    }
}
