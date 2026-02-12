using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Core.Enums;
using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.Mappers; // Added using
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

        // Exceptions handled by GlobalExceptionMiddleware
        var result = await _intelligenceService.ScoutCompanyAsync(request.Url);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CompanyDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var companies = await _repository.GetAllByUserIdAsync(userId);
        var dtos = companies.Select(CompanyMapper.MapToDto); // Simplified

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CompanyDto>> Get(Guid id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (company.UserId != userId) return NotFound();

        return Ok(CompanyMapper.MapToDto(company)); // Simplified
    }

    /// <summary>
    /// Get detailed company information including application history
    /// </summary>
    [HttpGet("{id}/details")]
    public async Task<ActionResult<CompanyDetailDto>> GetDetails(Guid id)
    {
        var company = await _repository.GetByIdAsync(id);

        if (company == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (company.UserId != userId) return NotFound();

        return Ok(CompanyMapper.MapToDetailDto(company)); // Simplified
    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> Create(CreateCompanyDto createDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var company = CompanyMapper.MapToEntity(createDto, userId); // Use Mapper

        await _repository.AddAsync(company);

        // Fetch again to ensure all return mapping is correct
        return CreatedAtAction(nameof(Get), new { id = company.Id }, CompanyMapper.MapToDto(company));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateCompanyDto updateDto)
    {
        var existingCompany = await _repository.GetByIdAsync(id);

        if (existingCompany == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (existingCompany.UserId != userId) return NotFound();

        CompanyMapper.ApplyUpdate(updateDto, existingCompany); // Use Mapper

        await _repository.UpdateAsync(existingCompany);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existingCompany = await _repository.GetByIdAsync(id);
        if (existingCompany == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        if (existingCompany.UserId != userId) return NotFound();

        await _repository.DeleteAsync(id);
        return NoContent();
    }
}