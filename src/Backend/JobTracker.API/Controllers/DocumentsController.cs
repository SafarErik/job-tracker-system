using JobTracker.API.DTOs;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
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

    // GET: api/Documents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
    {
        var documents = await _documentRepository.GetAllAsync();
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
        var document = await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
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
        var document = await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
        }

        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
        var filePath = Path.Combine(uploadsFolder, document.FileName);

        if (!System.IO.File.Exists(filePath))
        {
            _logger.LogError($"File not found: {filePath}");
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

        // Validate file type (only PDF for now)
        if (file.ContentType != "application/pdf")
        {
            return BadRequest("Only PDF files are allowed");
        }

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File size must not exceed 10MB");
        }

        try
        {
            // Create uploads folder if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create document entity
            var document = new Document
            {
                Id = Guid.NewGuid(),
                FileName = fileName,
                OriginalFileName = file.FileName,
                FileSize = file.Length,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            // Save to database
            await _documentRepository.CreateAsync(document);

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
            _logger.LogError(ex, "Error uploading document");
            return StatusCode(500, "An error occurred while uploading the file");
        }
    }

    // DELETE: api/Documents/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(Guid id)
    {
        var document = await _documentRepository.GetByIdAsync(id);

        if (document == null)
        {
            return NotFound();
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
            _logger.LogError(ex, $"Error deleting document {id}");
            return StatusCode(500, "An error occurred while deleting the document");
        }
    }
}
