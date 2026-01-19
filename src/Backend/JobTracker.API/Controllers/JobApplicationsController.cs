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

    // Dependency Injection
    public JobApplicationsController(IJobApplicationRepository repository)
    {
        _repository = repository;
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
            CompanyName = app.Company?.Name ?? "Unknown Company" // Null check, just to be safe
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
            CompanyName = app.Company?.Name ?? "Unknown Company" // Null check, just to be safe
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
            AppliedAt = DateTime.UtcNow // This is set by the server
        };

        await _repository.AddAsync(application);

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
            CompanyName = application.Company?.Name ?? "Unknown Company"
        };

        return CreatedAtAction(nameof(Get), new { id = application.Id }, dto);

    }

    // PUT: api/jobapplications/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateJobApplicationDto updateDto)
    {
        var existingApp = await _repository.GetByIdAsync(id);

        if (existingApp == null) return NotFound();

        // Manual update (Mapping)
        existingApp.Position = updateDto.Position;
        existingApp.CompanyId = updateDto.CompanyId; // We can even move it to another company
        existingApp.JobUrl = updateDto.JobUrl;
        existingApp.Description = updateDto.Description;
        existingApp.Status = updateDto.Status;
        
        // Note: We usually do not allow modifying the AppliedAt date here,
        // so we left it out of the copying (it remains the original).

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