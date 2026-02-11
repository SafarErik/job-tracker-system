using JobTracker.Application.Interfaces;
using JobTracker.Core.Entities;
using JobTracker.Core.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Service for managing file uploads and storage.
/// Handles validation, security checks, and physical file operations.
/// </summary>
public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileStorageService> _logger;
    private readonly string _uploadsFolder;

    // Allowed file types for security
    private static readonly string[] AllowedContentTypes = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    private static readonly string[] AllowedExtensions = { ".pdf", ".doc", ".docx" };

    private const long MaxFileSize = 10 * 1024 * 1024; // 10MB

    public FileStorageService(
        IWebHostEnvironment environment,
        ILogger<FileStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
        _uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
    }

    public async Task<Document> UploadFileAsync(Stream fileStream, string fileName, string contentType, string userId)
    {
        if (fileStream == null || fileStream.Length == 0)
        {
            throw new ArgumentException("No file uploaded");
        }

        // 1. Validate Size
        if (fileStream.Length > MaxFileSize)
        {
            throw new ArgumentException($"File size must not exceed {MaxFileSize / 1024 / 1024}MB");
        }

        // 2. Validate Type
        var fileExtension = Path.GetExtension(fileName)?.ToLowerInvariant();
        if (string.IsNullOrEmpty(fileExtension) ||
            !AllowedContentTypes.Contains(contentType) ||
            !AllowedExtensions.Contains(fileExtension))
        {
            throw new ArgumentException("Only PDF and Word documents are allowed");
        }

        // 3. Sanitize Filename
        var originalFileName = Path.GetFileName(fileName);
        if (string.IsNullOrEmpty(originalFileName) ||
            originalFileName.Contains("..") ||
            originalFileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            throw new ArgumentException("Invalid file name");
        }

        try
        {
            // Ensure uploads folder exists
            Directory.CreateDirectory(_uploadsFolder);

            // Generate unique secure filename
            var newFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadsFolder, newFileName);

            // 4. Security Check: Path Traversal
            if (!IsPathSafe(filePath))
            {
                _logger.LogError("Path traversal attempt detected: {FilePath}", filePath);
                throw new SecurityException("Invalid file path");
            }

            // 5. Save File
            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await fileStream.CopyToAsync(stream);
            }

            _logger.LogInformation("File saved successfully: {FileName}", newFileName);

            // 6. Return Document Entity (Not persisted to DB yet, just the object)
            return new Document
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                FileName = newFileName,
                OriginalFileName = originalFileName,
                FileSize = fileStream.Length,
                ContentType = contentType,
                UploadedAt = DateTime.UtcNow,
                Type = DocumentType.Other
            };
        }
        catch (Exception ex) when (ex is not ArgumentException && ex is not SecurityException)
        {
            _logger.LogError(ex, "Error uploading file for user {UserId}", userId);
            throw new IOException("An error occurred while saving the file", ex);
        }
    }

    public Task DeleteFileAsync(string fileName)
    {
        if (string.IsNullOrEmpty(fileName)) return Task.CompletedTask;

        var filePath = Path.Combine(_uploadsFolder, fileName);

        if (!IsPathSafe(filePath))
        {
            _logger.LogError("Path traversal attempt detection during delete: {FilePath}", filePath);
            return Task.CompletedTask; // Fail silently for security
        }

        if (File.Exists(filePath))
        {
            try
            {
                File.Delete(filePath);
                _logger.LogInformation("File deleted: {FileName}", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting file {FileName}", fileName);
                // We don't throw here to avoid breaking the transaction if DB delete succeeds
            }
        }

        return Task.CompletedTask;
    }

    public async Task<Stream> GetFileStreamAsync(string fileName)
    {
        var filePath = GetFilePath(fileName);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("File not found", fileName);
        }

        var memory = new MemoryStream();
        using (var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;
        return memory;
    }

    public string GetFilePath(string fileName)
    {
        var filePath = Path.Combine(_uploadsFolder, fileName);

        if (!IsPathSafe(filePath))
        {
            throw new SecurityException("Invalid file path");
        }

        return filePath;
    }

    public bool FileExists(string fileName)
    {
        var filePath = Path.Combine(_uploadsFolder, fileName);
        return IsPathSafe(filePath) && File.Exists(filePath);
    }

    private bool IsPathSafe(string path)
    {
        var fullPath = Path.GetFullPath(path);
        var uploadsFullPath = Path.GetFullPath(_uploadsFolder);

        // Ensure trailing separator for correct prefix check
        if (!uploadsFullPath.EndsWith(Path.DirectorySeparatorChar))
        {
            uploadsFullPath += Path.DirectorySeparatorChar;
        }

        return fullPath.StartsWith(uploadsFullPath, StringComparison.OrdinalIgnoreCase);
    }
}
