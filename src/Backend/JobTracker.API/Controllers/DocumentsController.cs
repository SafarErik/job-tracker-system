using JobTracker.Application.DTOs.Documents;
using JobTracker.Application.Interfaces;
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
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(
        IDocumentRepository documentRepository,
        IFileStorageService fileStorageService,
        ILogger<DocumentsController> logger)
    {
        _documentRepository = documentRepository;
        _fileStorageService = fileStorageService;
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
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User ID not found in token");

        var documents = await _documentRepository.GetAllByUserIdAsync(userId);
        return Ok(documents.Select(MapToDto));
    }

    // GET: api/Documents/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetDocument(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User ID not found in token");

        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null) return NotFound();
        if (document.UserId != userId) return Forbid();

        return Ok(MapToDto(document));
    }

    // GET: api/Documents/{id}/download
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadDocument(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized("User ID not found in token");

        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null) return NotFound();
        if (document.UserId != userId) return Forbid();

        try
        {
            var stream = await _fileStorageService.GetFileStreamAsync(document.FileName);
            return File(stream, document.ContentType, document.OriginalFileName);
        }
        catch (FileNotFoundException)
        {
            _logger.LogError("File not found on server: {FileName}", document.FileName);
            return NotFound("File not found on server");
        }
    }

    // POST: api/Documents/upload
    [HttpPost("upload")]
    public async Task<ActionResult<DocumentDto>> UploadDocument(IFormFile file)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            // Delegate file validation and storage to service
            var document = await _fileStorageService.UploadFileAsync(file, userId);

            // Persist metadata
            await _documentRepository.CreateAsync(document);

            _logger.LogInformation("Document uploaded successfully: {DocumentId} by user {UserId}", document.Id, userId);

            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, MapToDto(document));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document for user {UserId}", userId);
            return StatusCode(500, "An error occurred while uploading the file");
        }
    }

    // POST: api/Documents/{id}/master
    [HttpPost("{id}/master")]
    public async Task<ActionResult<DocumentDto>> SetMasterDocument(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null) return NotFound();
        if (document.UserId != userId) return Forbid();

        if (document.IsMaster) return Ok(MapToDto(document));

        var documents = await _documentRepository.GetAllByUserIdAsync(userId);
        var currentMaster = documents.FirstOrDefault(d => d.Type == document.Type && d.IsMaster);

        if (currentMaster != null)
        {
            currentMaster.IsMaster = false;
            await _documentRepository.UpdateAsync(currentMaster);
        }

        document.IsMaster = true;
        await _documentRepository.UpdateAsync(document);

        return Ok(MapToDto(document));
    }

    // DELETE: api/Documents/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var document = await _documentRepository.GetByIdAsync(id);
        if (document == null) return NotFound();
        if (document.UserId != userId) return Forbid();

        try
        {
            // Delete physical file
            await _fileStorageService.DeleteFileAsync(document.FileName);

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

    private static DocumentDto MapToDto(Document document)
    {
        return new DocumentDto
        {
            Id = document.Id,
            OriginalFileName = document.OriginalFileName,
            FileSize = document.FileSize,
            ContentType = document.ContentType,
            UploadedAt = document.UploadedAt,
            Type = document.Type,
            IsMaster = document.IsMaster
        };
    }
}
