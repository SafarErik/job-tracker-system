using JobTracker.Application.DTOs.Documents;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobTracker.API.Controllers;

/// <summary>
/// Controller for managing user documents (CVs, cover letters, etc.).
/// All endpoints require authentication - users can only access their own documents.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(
        IDocumentRepository documentRepository,
        IWebHostEnvironment environment,
        ILogger<DocumentsController> logger)
    {
        _documentRepository = documentRepository;
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Gets the current authenticated user's ID from the JWT token claims.
    /// Returns null if the claim is missing (caller should handle with Unauthorized response).
    /// </summary>
    /// <returns>User ID string or null if not found in claims</returns>
    private string? GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // GET: api/Documents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
    {
        // Validate user is authenticated and has valid claim
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }
        
        // Only get documents belonging to the current user
        var documents = await _documentRepository.GetAllByUserIdAsync(userId);
        
        var documentDtos = documents.Select(d => new DocumentDto
        {
            Id = d.Id,
            OriginalFileName = d.OriginalFileName,
            FileSize = d.FileSize,
            ContentType = d.ContentType,
            UploadedAt = d.UploadedAt
        });

        return Ok(documentDtos);
    }

    // GET: api/Documents/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(Guid id)
    {
        // Validate user is authenticated
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }

        var document = await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
        }

        // Security check: Ensure document belongs to current user
        if (document.UserId != userId)
        {
            return Forbid();
        }

        var documentDto = new DocumentDto
        {
            Id = document.Id,
            OriginalFileName = document.OriginalFileName,
            FileSize = document.FileSize,
            ContentType = document.ContentType,
            UploadedAt = document.UploadedAt
        };

        return Ok(documentDto);
    }

    // GET: api/Documents/{id}/download
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        // Validate user is authenticated
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }

        var document = await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
        }

        // Security check: Ensure document belongs to current user
        if (document.UserId != userId)
        {
            return Forbid();
        }

        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
        var filePath = Path.Combine(uploadsFolder, document.FileName);

        if (!System.IO.File.Exists(filePath))
        {
            _logger.LogError("File not found: {FilePath}", filePath);
            return NotFound("File not found on server");
        }

        var memory = new MemoryStream();
        using (var stream = new FileStream(filePath, FileMode.Open))
        {
            await stream.CopyToAsync(memory);
        }
        memory.Position = 0;

        return File(memory, document.ContentType, document.OriginalFileName);
    }

    // POST: api/Documents/upload
    [HttpPost("upload")]
    public async Task<ActionResult<DocumentDto>> UploadDocument(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File size must not exceed 10MB");
        }

        // Validate file type using both content type and file extension
        var allowedContentTypes = new[] { "application/pdf", "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
        
        var fileExtension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
        
        if (!allowedContentTypes.Contains(file.ContentType) || 
            string.IsNullOrEmpty(fileExtension) ||
            !allowedExtensions.Contains(fileExtension))
        {
            return BadRequest("Only PDF and Word documents are allowed");
        }

        // Sanitize filename to prevent path traversal attacks
        var originalFileName = Path.GetFileName(file.FileName);
        if (string.IsNullOrEmpty(originalFileName) || 
            originalFileName.Contains("..") ||
            originalFileName.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            return BadRequest("Invalid file name");
        }

        try
        {
            var userId = GetUserId();
            
            // Check if user is authenticated
            if (userId == null)
            {
                return Unauthorized();
            }
            
            // Create uploads folder if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename with sanitized extension
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            
            // Additional security: Verify the resolved path is still within uploads folder
            var fullPath = Path.GetFullPath(filePath);
            var uploadsFullPath = Path.GetFullPath(uploadsFolder);
            if (!fullPath.StartsWith(uploadsFullPath, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogError("Path traversal attempt detected: {FilePath}", filePath);
                return BadRequest("Invalid file path");
            }
            // Additional security: Verify the resolved path is still within uploads folder
            var fullPath = Path.GetFullPath(filePath);
            var uploadsFullPath = Path.GetFullPath(uploadsFolder);
            if (!fullPath.StartsWith(uploadsFullPath, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogError("Path traversal attempt detected: {FilePath}", filePath);
                return BadRequest("Invalid file path");
            }

            // Save file to disk with security best practices
            using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                await file.CopyToAsync(stream);
            }
            
            // TODO: In production, integrate with antivirus scanning service
            // Example: Azure Defender for Storage or third-party API
            // await AntivirusService.ScanFileAsync(filePath);

            // Create document entity with user ownership
            var document = new Document
            {
                Id = Guid.NewGuid(),
                UserId = userId, // Link document to authenticated user
                FileName = fileName,
                OriginalFileName = originalFileName, // Use sanitized filename
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            // Save to database
            await _documentRepository.CreateAsync(document);
            
            _logger.LogInformation("Document uploaded successfully: {DocumentId} by user {UserId}", 
                document.Id, userId);

            var documentDto = new DocumentDto
            {
                Id = document.Id,
                OriginalFileName = document.OriginalFileName,
                FileSize = document.FileSize,
                ContentType = document.ContentType,
                UploadedAt = document.UploadedAt
            };

            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, documentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document for user {UserId}", GetUserId());
            return StatusCode(500, "An error occurred while uploading the file");
        }
    }

    // DELETE: api/Documents/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var userId = GetUserId();
        
        // Check if user is authenticated
        if (userId == null)
        {
            return Unauthorized();
        }
        
        var document = await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
        }

        // Security check: Only allow owners to delete their documents
        if (document.UserId != userId)
        {
            return Forbid();
        }

        try
        {
            // Delete physical file
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
            var filePath = Path.Combine(uploadsFolder, document.FileName);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Delete from database
            await _documentRepository.DeleteAsync(id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId}", id);
            return StatusCode(500, "An error occurred while deleting the document");
        }
    }
}
