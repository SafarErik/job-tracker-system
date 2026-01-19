using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.API.DTOs;

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
            ContactPerson = c.ContactPerson
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
            ContactPerson = company.ContactPerson
        };

        return Ok(dto);

    }

    [HttpPost]
    public async Task<ActionResult<CompanyDto>> Create(CreateCompanyDto createDto) {
        var company = new Company
        {
            Name = createDto.Name,
            Website = createDto.Website,
            ContactPerson = createDto.ContactPerson
        };

        var id = await _repository.AddAsync(company);
        
        var dto = new CompanyDto
        {
            Id = id,
            Name = company.Name,
            Website = company.Website,
            ContactPerson = company.ContactPerson
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

        //Mapping   
        // Here we don't need to create a new object, just update the existing one.
        existingCompany.Name = updateDto.Name;
        existingCompany.Website = updateDto.Website;
        existingCompany.ContactPerson = updateDto.ContactPerson;

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