using JobTracker.Core.Entities;
using Microsoft.AspNetCore.Http;

namespace JobTracker.Application.Interfaces;

/// <summary>
/// Interface for file storage operations including validation, upload, and deletion.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Validates and uploads a file to the storage system.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="userId">The ID of the user uploading the file.</param>
    /// <returns>A Document entity with file metadata.</returns>
    Task<Document> UploadFileAsync(IFormFile file, string userId);

    /// <summary>
    /// Deletes a file from the storage system.
    /// </summary>
    /// <param name="fileName">The name of the file to delete.</param>
    Task DeleteFileAsync(string fileName);

    /// <summary>
    /// Retrieves a file stream for downloading.
    /// </summary>
    /// <param name="fileName">The name of the file to retrieve.</param>
    /// <returns>A FileStream of the file content.</returns>
    Task<Stream> GetFileStreamAsync(string fileName);

    /// <summary>
    /// Gets the full physical path of a file.
    /// </summary>
    /// <param name="fileName">The name of the file.</param>
    /// <returns>The full path string.</returns>
    string GetFilePath(string fileName);

    /// <summary>
    /// Validates if a file exists and is accessible.
    /// </summary>
    /// <param name="fileName">The name of the file.</param>
    /// <returns>True if accessible, false otherwise.</returns>
    bool FileExists(string fileName);
}
