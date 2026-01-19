using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;

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
    public async Task<ActionResult<IEnumerable<JobApplication>>> GetAll()
    {
        var applications = await _repository.GetAllAsync();
        return Ok(applications); // 200 OK + data in JSON
    }


    // GET: api/jobapplications/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplication>> Get(int id)
    {
        var application = await _repository.GetByIdAsync(id);

        if(application == null)
        {
            return NotFound(); // 404 - ID Doesn't exist!

        }

        return Ok(application);


    }

    // POST: api/jobapplications
    [HttpPost]
    public async Task<ActionResult<JobApplication>> Create(JobApplication application)
    {
        await _repository.AddAsync(application);

        return CreatedAtAction(nameof(Get), new {id = application.Id}, application);

    }

    // DELETE: api/jobapplications/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteAsync(id);
        return NoContent(); // 204 - The delete was succesful!

    }

    
}