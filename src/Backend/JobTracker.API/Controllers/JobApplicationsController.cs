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
    /// Returns null if the claim is missing (caller should handle with Unauthorized response).
    /// </summary>
    /// <returns>User ID string or null if not found in claims</returns>
    private string? GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // GET: api/jobapplications
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAll()
    {
        // Validate user is authenticated and has valid claim
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }
        
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
            DocumentName = app.Document?.OriginalFileName,
            WorkplaceType = app.WorkplaceType,
            Priority = app.Priority,
            MatchScore = app.MatchScore,
            SalaryOffer = app.SalaryOffer
        });

        return Ok(dtos);
    }


    // GET: api/jobapplications/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> Get(int id)
    {
        // Validate user is authenticated
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }

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
            DocumentName = app.Document?.OriginalFileName,
            JobType = app.JobType,
            WorkplaceType = app.WorkplaceType,
            Priority = app.Priority,
            MatchScore = app.MatchScore,
            SalaryOffer = app.SalaryOffer
        };

        return Ok(dto);
    }

    // POST: api/jobapplications
    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(CreateJobApplicationDto createDto)
    {
        // Validate user is authenticated
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }

        // MAPPING: DTO -> Entity
        var application = new JobApplication
        {
            UserId = userId, // Link to the authenticated user
            Position = createDto.Position,
            CompanyId = createDto.CompanyId,
            JobUrl = createDto.JobUrl,
            Description = createDto.Description,
            Status = createDto.Status,
            JobType = createDto.JobType,
            WorkplaceType = createDto.WorkplaceType,
            Priority = createDto.Priority,
            MatchScore = createDto.MatchScore,
            SalaryOffer = createDto.SalaryOffer,
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
            DocumentName = documentName,
            JobType = application.JobType,
            WorkplaceType = application.WorkplaceType,
            Priority = application.Priority,
            MatchScore = application.MatchScore,
            SalaryOffer = application.SalaryOffer
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
        // Validate user is authenticated
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }

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

        if (updateDto.JobType.HasValue)
            existingApp.JobType = updateDto.JobType.Value;

        if (updateDto.WorkplaceType.HasValue)
            existingApp.WorkplaceType = updateDto.WorkplaceType.Value;

        if (updateDto.Priority.HasValue)
            existingApp.Priority = updateDto.Priority.Value;

        if (updateDto.MatchScore.HasValue)
            existingApp.MatchScore = updateDto.MatchScore.Value;

        if (updateDto.SalaryOffer.HasValue)
            existingApp.SalaryOffer = updateDto.SalaryOffer.Value;
        
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
        // Validate user is authenticated
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized("User ID not found in token");
        }

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