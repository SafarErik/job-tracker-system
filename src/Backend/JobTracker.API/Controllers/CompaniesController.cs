using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;

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
    public async Task<ActionResult<IEnumerable<Company>>> GetAll()
    {
        return Ok(await _repository.GetAllAsync());

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Company>> Get(int id)
    {
        var company = await _repository.GetByIdAsync(id);

        if(company == null)
        {
            return NotFound(); // 404 - ID Doesn't exist!

        }

        return Ok(company);

    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(Company company) {
        var id = await _repository.AddAsync(company);
        return CreatedAtAction(nameof(GetAll), new { id }, company);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Company company)
    {
        if (id != company.Id)
        {
            return BadRequest("ID mismatch URL - BODY");

        }

        var existingCompany = await _repository.GetByIdAsync(id);
        if(existingCompany == null)
        {
            return NotFound();
        }

        await _repository.UpdateAsync(company);
        return NoContent(); // 204 - Everything is fine

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