using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Application.DTOs.JobApplications;

namespace JobTracker.API.Controllers;

/// <summary>
/// Controller for managing job applications.
/// All endpoints require authentication - users can only see/modify their own applications.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires authentication for all endpoints
public class JobApplicationsController : ControllerBase
{
    private readonly IJobApplicationRepository _repository;
    private readonly IDocumentRepository _documentRepository;

    public JobApplicationsController(
        IJobApplicationRepository repository, 
        IDocumentRepository documentRepository)
    {
        _repository = repository;
        _documentRepository = documentRepository;
    }

    /// <summary>
    /// Gets the current authenticated user's ID from the JWT token claims.
    /// </summary>
    private string GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
        ?? throw new UnauthorizedAccessException("User ID not found in token");

    // GET: api/jobapplications
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAll()
    {
        var userId = GetUserId();
        
        // Only get applications belonging to the current user
        var applications = await _repository.GetAllByUserIdAsync(userId);

        var dtos = applications.Select(app => new JobApplicationDto
        {
            Id = app.Id,
            Position = app.Position,
            JobUrl = app.JobUrl,
            Description = app.Description,
            AppliedAt = app.AppliedAt,
            Status = app.Status,
            CompanyId = app.CompanyId,
            CompanyName = app.Company?.Name ?? "Unknown Company",
            DocumentId = app.DocumentId,
            DocumentName = app.Document?.OriginalFileName
        });

        return Ok(dtos);
    }


    // GET: api/jobapplications/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> Get(int id)
    {
        var userId = GetUserId();
        var app = await _repository.GetByIdAsync(id);

        if (app == null)
        {
            return NotFound();
        }

        // Security check: Ensure the application belongs to the current user
        if (app.UserId != userId)
        {
            return Forbid(); // 403 - User doesn't own this resource
        }

        var dto = new JobApplicationDto
        {
            Id = app.Id,
            Position = app.Position,
            JobUrl = app.JobUrl,
            Description = app.Description,
            AppliedAt = app.AppliedAt,
            Status = app.Status,
            CompanyId = app.CompanyId,
            CompanyName = app.Company?.Name ?? "Unknown Company",
            DocumentId = app.DocumentId,
            DocumentName = app.Document?.OriginalFileName
        };

        return Ok(dto);
    }

    // POST: api/jobapplications
    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(CreateJobApplicationDto createDto)
    {
        var userId = GetUserId();

        // MAPPING: DTO -> Entity
        var application = new JobApplication
        {
            UserId = userId, // Link to the authenticated user
            Position = createDto.Position,
            CompanyId = createDto.CompanyId,
            JobUrl = createDto.JobUrl,
            Description = createDto.Description,
            Status = createDto.Status,
            DocumentId = createDto.DocumentId,
            AppliedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(application);

        // Populate DocumentName if a document was associated
        string? documentName = null;
        if (application.DocumentId.HasValue)
        {
            var document = await _documentRepository.GetByIdAsync(application.DocumentId.Value);
            documentName = document?.OriginalFileName;
        }

        // We return with the created object
        var dto = new JobApplicationDto
        {
            Id = application.Id,
            Position = application.Position,
            JobUrl = application.JobUrl,
            Description = application.Description,
            AppliedAt = application.AppliedAt,
            Status = application.Status,
            CompanyId = application.CompanyId,
            CompanyName = application.Company?.Name ?? "Unknown Company",
            DocumentId = application.DocumentId,
            DocumentName = documentName
        };

        return CreatedAtAction(nameof(Get), new { id = application.Id }, dto);
    }

    // PUT: api/jobapplications/5
    /// <summary>
    /// Update a job application. Supports partial updates.
    /// Only the owner of the application can update it.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateJobApplicationDto updateDto)
    {
        var userId = GetUserId();
        var existingApp = await _repository.GetByIdAsync(id);

        if (existingApp == null) return NotFound();

        // Security check: Only allow owners to update their applications
        if (existingApp.UserId != userId)
        {
            return Forbid();
        }

        // Partial update - only update fields that are provided
        if (updateDto.Position != null)
            existingApp.Position = updateDto.Position;
        
        if (updateDto.CompanyId.HasValue)
            existingApp.CompanyId = updateDto.CompanyId.Value;
        
        if (updateDto.JobUrl != null)
            existingApp.JobUrl = updateDto.JobUrl;
        
        if (updateDto.Description != null)
            existingApp.Description = updateDto.Description;
        
        if (updateDto.Status.HasValue)
            existingApp.Status = updateDto.Status.Value;
        
        if (updateDto.DocumentIdProvided)
            existingApp.DocumentId = updateDto.DocumentId;

        await _repository.UpdateAsync(existingApp);

        return NoContent();
    }

    // DELETE: api/jobapplications/5
    /// <summary>
    /// Delete a job application. Only the owner can delete.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var app = await _repository.GetByIdAsync(id);
        
        if (app == null) return NotFound();

        // Security check: Only allow owners to delete their applications
        if (app.UserId != userId)
        {
            return Forbid();
        }

        await _repository.DeleteAsync(id);
        return NoContent();
    }

    
}