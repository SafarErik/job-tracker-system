using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Application.Interfaces;
using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Application.DTOs.AI;
using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.Mappers;

namespace JobTracker.API.Controllers;

/// <summary>
/// Controller for managing job applications.
/// All endpoints require authentication - users can only see/modify their own applications.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires authentication for all endpoints
public class JobApplicationsController(
    IJobApplicationRepository repository,
    IDocumentRepository documentRepository,
    IJobApplicationService jobApplicationService) : ControllerBase
{
    private const string UserIdNotFoundMessage = "User ID not found in token";

    private readonly IJobApplicationRepository _repository = repository;
    private readonly IDocumentRepository _documentRepository = documentRepository;
    private readonly IJobApplicationService _jobApplicationService = jobApplicationService;

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
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        var applications = await _repository.GetAllByUserIdAsync(userId);
        var dtos = applications.Select(JobApplicationMapper.MapToDto);

        return Ok(dtos);
    }


    // GET: api/jobapplications/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> Get(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        var app = await _repository.GetByIdAsync(id);

        if (app == null) return NotFound();

        if (app.UserId != userId) return Forbid();

        return Ok(JobApplicationMapper.MapToDto(app));
    }

    // POST: api/jobapplications
    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(CreateJobApplicationDto createDto)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        var application = JobApplicationMapper.MapToEntity(createDto, userId);

        await _repository.AddAsync(application);

        // Reload to populate navigation properties
        var createdApp = await _repository.GetByIdAsync(application.Id);

        if (createdApp == null) return StatusCode(500, "Failed to retrieve created application");

        return CreatedAtAction(nameof(Get), new { id = createdApp.Id }, JobApplicationMapper.MapToDto(createdApp));
    }

    // PUT: api/jobapplications/5
    /// <summary>
    /// Update a job application. Supports partial updates.
    /// Only the owner of the application can update it.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateJobApplicationDto updateDto)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        var existingApp = await _repository.GetByIdAsync(id);

        if (existingApp == null) return NotFound();

        if (existingApp.UserId != userId) return Forbid();

        JobApplicationMapper.ApplyUpdate(updateDto, existingApp);

        await _repository.UpdateAsync(existingApp);

        return NoContent();
    }

    // DELETE: api/jobapplications/5
    /// <summary>
    /// Delete a job application. Only the owner can delete.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        var app = await _repository.GetByIdAsync(id);

        if (app == null) return NotFound();

        if (app.UserId != userId) return Forbid();

        await _repository.DeleteAsync(id);
        return NoContent();
    }

    // POST: api/jobapplications/{id}/analyze
    /// <summary>
    /// Trigger AI analysis for a job application.
    /// Analyzes the job description against the user's master resume.
    /// Updates the application with match score and AI feedback.
    /// </summary>
    [HttpPost("{id}/analyze")]
    public async Task<ActionResult<JobApplicationDto>> Analyze(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        // Exceptions handled by GlobalExceptionMiddleware
        var result = await _jobApplicationService.TriggerAIAnalysisAsync(id, userId);
        return Ok(result);
    }

    // POST: api/jobapplications/{id}/generate-assets
    /// <summary>
    /// Generates tailored resume and cover letter assets using AI.
    /// </summary>
    [HttpPost("{id}/generate-assets")]
    public async Task<ActionResult<AiGeneratedAssetsDto>> GenerateAssets(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        // Exceptions handled by GlobalExceptionMiddleware
        var result = await _jobApplicationService.GenerateAssetsAsync(id, userId);
        return Ok(result);
    }

    // POST: api/jobapplications/{id}/cover-letter
    [HttpPost("{id}/cover-letter")]
    public async Task<ActionResult<string>> GenerateCoverLetter(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        // Exceptions handled by GlobalExceptionMiddleware
        var result = await _jobApplicationService.GenerateCoverLetterAsync(id, userId);
        return Ok(new { content = result });
    }

    // POST: api/jobapplications/{id}/resume-optimize
    [HttpPost("{id}/resume-optimize")]
    public async Task<ActionResult<string>> OptimizeResume(Guid id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized(UserIdNotFoundMessage);

        // Exceptions handled by GlobalExceptionMiddleware
        var result = await _jobApplicationService.OptimizeResumeAsync(id, userId);
        return Ok(new { content = result });
    }
}