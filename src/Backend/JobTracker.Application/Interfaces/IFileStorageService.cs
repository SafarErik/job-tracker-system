using JobTracker.Core.Entities;

namespace JobTracker.Application.Interfaces;

/// <summary>
/// Interface for file storage operations including validation, upload, and deletion.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Validates and uploads a file to the storage system.
    /// </summary>
    /// <param name="fileStream">The stream of the file to upload.</param>
    /// <param name="fileName">The original name of the file.</param>
    /// <param name="contentType">The MIME type of the file.</param>
    /// <param name="userId">The ID of the user uploading the file.</param>
    /// <returns>A Document entity with file metadata.</returns>
    Task<Document> UploadFileAsync(Stream fileStream, string fileName, string contentType, string userId);

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
