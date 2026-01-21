using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Application.DTOs.Companies;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyRepository _repository;

    public CompaniesController(ICompanyRepository repository)
    {
        _repository = repository;

    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetAll()
    {
        var companies = await _repository.GetAllAsync();
        
        // Mapping --> Entity => DTO
        // projection => We project the data by hand
        var dtos = companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            Name = c.Name,
            Website = c.Website,
            Address = c.Address,
            HRContactName = c.HRContactName,
            HRContactEmail = c.HRContactEmail,
            HRContactLinkedIn = c.HRContactLinkedIn,
            TotalApplications = c.JobApplications?.Count ?? 0
        });

        return Ok(dtos);

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> Get(int id)
    {
        var company = await _repository.GetByIdAsync(id);

        if(company == null)
        {
            return NotFound(); // 404 - ID Doesn't exist!

        }

        var dto = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            HRContactName = company.HRContactName,
            HRContactEmail = company.HRContactEmail,
            HRContactLinkedIn = company.HRContactLinkedIn,
            TotalApplications = company.JobApplications?.Count ?? 0
        };

        return Ok(dto);

    }

    /// <summary>
    /// Get detailed company information including application history
    /// </summary>
    /// <param name="id">Company ID</param>
    /// <returns>Detailed company information with all job applications</returns>
    [HttpGet("{id}/details")]
    public async Task<ActionResult<CompanyDetailDto>> GetDetails(int id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null)
        {
            return NotFound();
        }

        var detailDto = new CompanyDetailDto
        {
            Id = company.Id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            HRContactName = company.HRContactName,
            HRContactEmail = company.HRContactEmail,
            HRContactLinkedIn = company.HRContactLinkedIn,
            TotalApplications = company.JobApplications?.Count ?? 0,
            ApplicationHistory = company.JobApplications?
                .OrderByDescending(ja => ja.AppliedAt)
                .Select(ja => new JobApplicationHistoryDto
                {
                    Id = ja.Id,
                    Position = ja.Position,
                    AppliedAt = ja.AppliedAt,
                    Status = ja.Status.ToString(),
                    SalaryOffer = ja.SalaryOffer
                })
                .ToList() ?? new List<JobApplicationHistoryDto>()
        };

        return Ok(detailDto);
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> Create(CreateCompanyDto createDto) {
        var company = new Company
        {
            Name = createDto.Name,
            Website = createDto.Website,
            Address = createDto.Address,
            HRContactName = createDto.HRContactName,
            HRContactEmail = createDto.HRContactEmail,
            HRContactLinkedIn = createDto.HRContactLinkedIn
        };

        var id = await _repository.AddAsync(company);
        
        var dto = new CompanyDto
        {
            Id = id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            HRContactName = company.HRContactName,
            HRContactEmail = company.HRContactEmail,
            HRContactLinkedIn = company.HRContactLinkedIn,
            TotalApplications = 0
        };
    
        return CreatedAtAction(nameof(Get), new { id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateCompanyDto updateDto)
    {
        var existingCompany = await _repository.GetByIdAsync(id);

        if(existingCompany == null)
        {
            return NotFound();
        }

        // Mapping: update existing entity with new values  
        existingCompany.Name = updateDto.Name;
        existingCompany.Website = updateDto.Website;
        existingCompany.Address = updateDto.Address;
        existingCompany.HRContactName = updateDto.HRContactName;
        existingCompany.HRContactEmail = updateDto.HRContactEmail;
        existingCompany.HRContactLinkedIn = updateDto.HRContactLinkedIn;

        await _repository.UpdateAsync(existingCompany);

        return NoContent(); // 204

    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existingCompany = await _repository.GetByIdAsync(id);
        if (existingCompany == null)
        {
            return NotFound();
        }

        await _repository.DeleteAsync(id);
        return NoContent();

    }


}