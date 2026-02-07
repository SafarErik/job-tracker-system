namespace JobTracker.Core.Interfaces;

/// <summary>
/// Interface for extracting text from document files (PDF, DOCX, etc.).
/// </summary>
public interface IDocumentTextExtractor
{
    /// <summary>
    /// Extracts plain text from a file.
    /// </summary>
    /// <param name="filePath">Absolute path to the file</param>
    /// <returns>Extracted text or empty string on failure</returns>
    Task<string> ExtractTextAsync(string filePath);
}
