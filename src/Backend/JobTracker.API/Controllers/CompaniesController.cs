using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Application.DTOs.Companies;
using System.Security.Claims;

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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        var companies = await _repository.GetAllByUserIdAsync(userId);

        // Mapping --> Entity => DTO
        // projection => We project the data by hand
        var dtos = companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            Name = c.Name,
            Website = c.Website,
            Address = c.Address,
            Industry = c.Industry,
            TechStack = c.TechStack?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
            TotalApplications = c.JobApplications?.Count ?? 0,
            Priority = c.Priority,
            RecentApplications = c.JobApplications?
                .OrderByDescending(ja => ja.AppliedAt)
                .Take(5)
                .Select(ja => new JobApplicationHistoryDto
                {
                    Id = ja.Id,
                    Position = ja.Position,
                    AppliedAt = ja.AppliedAt,
                    Status = ja.Status.ToString(),
                    SalaryOffer = ja.SalaryOffer
                }).ToList() ?? new List<JobApplicationHistoryDto>()
        });

        return Ok(dtos);

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> Get(Guid id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null)
        {
            return NotFound(); // 404 - ID Doesn't exist!
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        if (company.UserId != userId)
        {
            return NotFound();
        }

        var dto = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            TotalApplications = company.JobApplications?.Count ?? 0,
            Priority = company.Priority,
            RecentApplications = company.JobApplications?
                .OrderByDescending(ja => ja.AppliedAt)
                .Take(5)
                .Select(ja => new JobApplicationHistoryDto
                {
                    Id = ja.Id,
                    Position = ja.Position,
                    AppliedAt = ja.AppliedAt,
                    Status = ja.Status.ToString(),
                    SalaryOffer = ja.SalaryOffer
                }).ToList() ?? new List<JobApplicationHistoryDto>()
        };

        return Ok(dto);

    }

    /// <summary>
    /// Get detailed company information including application history
    /// </summary>
    /// <param name="id">Company ID</param>
    /// <returns>Detailed company information with all job applications</returns>
    [HttpGet("{id}/details")]
    public async Task<ActionResult<CompanyDetailDto>> GetDetails(Guid id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        if (company.UserId != userId)
        {
            return NotFound();
        }

        var detailDto = new CompanyDetailDto
        {
            Id = company.Id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            TotalApplications = company.JobApplications?.Count ?? 0,
            Priority = company.Priority,
            TechStack = company.TechStack?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>(),
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
                .ToList() ?? new List<JobApplicationHistoryDto>(),
            Contacts = company.Contacts?.Select(c => new CompanyContactDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                LinkedIn = c.LinkedIn,
                Role = c.Role
            }).ToList() ?? new List<CompanyContactDto>()
        };

        return Ok(detailDto);
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> Create(CreateCompanyDto createDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var company = new Company
        {
            UserId = userId,
            Name = createDto.Name,
            Website = createDto.Website,
            Address = createDto.Address,
            Industry = createDto.Industry,
            TechStack = createDto.TechStack != null ? string.Join(';', createDto.TechStack) : null,
            Priority = createDto.Priority ?? "Tier3",
            Contacts = createDto.Contacts?.Select(c => new CompanyContact
            {
                Name = c.Name,
                Email = c.Email,
                LinkedIn = c.LinkedIn,
                Role = c.Role
            }).ToList() ?? new List<CompanyContact>()
        };

        var id = await _repository.AddAsync(company);

        var dto = new CompanyDto
        {
            Id = id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            TotalApplications = 0,
            Priority = company.Priority
        };

        return CreatedAtAction(nameof(Get), new { id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateCompanyDto updateDto)
    {
        var existingCompany = await _repository.GetByIdAsync(id);

        if (existingCompany == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        if (existingCompany.UserId != userId)
        {
            return NotFound();
        }

        // Mapping: update existing entity with new values  
        if (!string.IsNullOrEmpty(updateDto.Name))
        {
            existingCompany.Name = updateDto.Name;
        }

        if (updateDto.Website != null)
        {
            existingCompany.Website = updateDto.Website;
        }

        if (updateDto.Address != null)
        {
            existingCompany.Address = updateDto.Address;
        }

        if (!string.IsNullOrEmpty(updateDto.Priority))
        {
            existingCompany.Priority = updateDto.Priority;
        }

        if (updateDto.Industry != null)
        {
            existingCompany.Industry = updateDto.Industry;
        }

        if (updateDto.TechStack != null)
        {
            existingCompany.TechStack = string.Join(';', updateDto.TechStack);
        }

        // Update Contacts
        if (updateDto.Contacts != null)
        {
            // Simple reconciliation: Remove items not in updateDto, Update existing, Add new
            var existingContacts = existingCompany.Contacts.ToList();

            // Remove
            foreach (var existing in existingContacts)
            {
                if (!updateDto.Contacts.Any(c => c.Id == existing.Id))
                {
                    existingCompany.Contacts.Remove(existing);
                }
            }

            // Add or Update
            foreach (var contactDto in updateDto.Contacts)
            {
                if (contactDto.Id == Guid.Empty)
                {
                    existingCompany.Contacts.Add(new CompanyContact
                    {
                        Name = contactDto.Name,
                        Email = contactDto.Email,
                        LinkedIn = contactDto.LinkedIn,
                        Role = contactDto.Role,
                        CompanyId = existingCompany.Id
                    });
                }
                else
                {
                    var contact = existingCompany.Contacts.FirstOrDefault(c => c.Id == contactDto.Id);
                    if (contact != null)
                    {
                        contact.Name = contactDto.Name;
                        contact.Email = contactDto.Email;
                        contact.LinkedIn = contactDto.LinkedIn;
                        contact.Role = contactDto.Role;
                    }
                }
            }
        }

        await _repository.UpdateAsync(existingCompany);

        return NoContent(); // 204

    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existingCompany = await _repository.GetByIdAsync(id);
        if (existingCompany == null)
        {
            return NotFound();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }
        if (existingCompany.UserId != userId)
        {
            return NotFound();
        }

        await _repository.DeleteAsync(id);
        return NoContent();

    }


}