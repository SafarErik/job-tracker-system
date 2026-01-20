using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.API.DTOs;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")] // /api/jobapplications => This will be the current address
public class JobApplicationsController : ControllerBase
{
    private readonly IJobApplicationRepository _repository;
    private readonly IDocumentRepository _documentRepository;

    // Dependency Injection
    public JobApplicationsController(IJobApplicationRepository repository, IDocumentRepository documentRepository)
    {
        _repository = repository;
        _documentRepository = documentRepository;
    }

    // GET: api/jobapplications
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAll()
    {
        var applications = await _repository.GetAllAsync();

        //Mapping: Entity => DTO
        // Here we also fill out the company.name, from the connected company object.
        var dtos = applications.Select(app => new JobApplicationDto
        {
            Id = app.Id,
            Position = app.Position,
            JobUrl = app.JobUrl,
            Description = app.Description,
            AppliedAt = app.AppliedAt,
            Status = app.Status,
            CompanyId = app.CompanyId,
            CompanyName = app.Company?.Name ?? "Unknown Company", // Null check, just to be safe
            DocumentId = app.DocumentId,
            DocumentName = app.Document?.OriginalFileName
        });

        return Ok(dtos); // 200: OK
    }


    // GET: api/jobapplications/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> Get(int id)
    {
        var app = await _repository.GetByIdAsync(id);

        if(app == null)
        {
            return NotFound(); // 404 - ID Doesn't exist!

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
            CompanyName = app.Company?.Name ?? "Unknown Company", // Null check, just to be safe
            DocumentId = app.DocumentId,
            DocumentName = app.Document?.OriginalFileName
        };

        return Ok(dto);


    }

    // POST: api/jobapplications
    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(CreateJobApplicationDto createDto)
    {
       // MAPPING: DTO -> Entity
        var application = new JobApplication
        {
            Position = createDto.Position,
            CompanyId = createDto.CompanyId, // The frontend only sends the ID
            JobUrl = createDto.JobUrl,
            Description = createDto.Description,
            Status = createDto.Status,
            DocumentId = createDto.DocumentId,
            AppliedAt = DateTime.UtcNow // This is set by the server
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
    /// </summary>
    /// <param name="id">Application ID</param>
    /// <param name="updateDto">Fields to update (only non-null fields will be updated)</param>
    /// <returns>NoContent if successful, NotFound if application doesn't exist</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateJobApplicationDto updateDto)
    {
        var existingApp = await _repository.GetByIdAsync(id);

        if (existingApp == null) return NotFound();

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
        
        // Note: We do not allow modifying the AppliedAt date

        await _repository.UpdateAsync(existingApp);

        return NoContent();
    }

    // DELETE: api/jobapplications/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var app = await _repository.GetByIdAsync(id);
        if (app == null) return NotFound();

        await _repository.DeleteAsync(id);
        return NoContent();
    }

    
}