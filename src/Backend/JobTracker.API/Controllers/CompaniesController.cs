using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Core.Enums;
using JobTracker.Application.DTOs.Companies;
using System.Security.Claims;

namespace JobTracker.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly ICompanyRepository _repository;
    private readonly ICompanyIntelligenceService _intelligenceService;

    public CompaniesController(ICompanyRepository repository, ICompanyIntelligenceService intelligenceService)
    {
        _repository = repository;
        _intelligenceService = intelligenceService;
    }

    /// <summary>
    /// Scouts a company by URL using the Intelligence Engine.
    /// </summary>
    [HttpPost("scout")]
    public async Task<ActionResult<ScoutedCompanyDto>> Scout(ScoutRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var result = await _intelligenceService.ScoutCompanyAsync(request.Url);

            if (!result.Success)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during scanning.", details = ex.Message });
        }
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

        var dtos = companies.Select(JobTracker.Application.Mappers.CompanyMapper.MapToDto);

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> Get(Guid id)
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

        return Ok(JobTracker.Application.Mappers.CompanyMapper.MapToDto(company));
    }

    /// <summary>
    /// Get detailed company information including application history
    /// </summary>
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

        return Ok(JobTracker.Application.Mappers.CompanyMapper.MapToDetailDto(company));
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
            LogoUrl = createDto.LogoUrl,
            HqLocation = createDto.HqLocation,
            Description = createDto.Description,
            Industry = createDto.Industry,
            Priority = createDto.Priority,
            TechStack = createDto.TechStack?.Select(s => new Skill { Name = s }).ToList() ?? new List<Skill>(),
            Contacts = createDto.Contacts?.Select(c => new CompanyContact
            {
                Name = c.Name,
                Email = c.Email,
                LinkedIn = c.LinkedIn,
                Role = c.Role
            }).ToList() ?? new List<CompanyContact>()
        };

        await _repository.AddAsync(company);

        // Fetch again to ensure all relationships/defaults are set if needed, or just map the entity
        // Since AddAsync sets the ID, we can map directly. 
        // Note: TotalApplications will be 0.
        return CreatedAtAction(nameof(Get), new { id = company.Id }, JobTracker.Application.Mappers.CompanyMapper.MapToDto(company));
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

        if (!string.IsNullOrEmpty(updateDto.Name)) existingCompany.Name = updateDto.Name;
        if (updateDto.Website != null) existingCompany.Website = updateDto.Website;
        if (updateDto.Address != null) existingCompany.Address = updateDto.Address;
        if (updateDto.LogoUrl != null) existingCompany.LogoUrl = updateDto.LogoUrl;
        if (updateDto.HqLocation != null) existingCompany.HqLocation = updateDto.HqLocation;
        if (updateDto.Description != null) existingCompany.Description = updateDto.Description;

        if (updateDto.Priority.HasValue)
        {
            existingCompany.Priority = updateDto.Priority.Value;
        }

        if (updateDto.Industry != null) existingCompany.Industry = updateDto.Industry;

        // SKIP TechStack update for now to avoid complexity in this fix.
        // It requires looking up skills or creating new ones.

        // Update Contacts
        if (updateDto.Contacts != null)
        {
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

        return NoContent();
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