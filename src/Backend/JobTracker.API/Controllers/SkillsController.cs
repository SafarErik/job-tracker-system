using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.API.DTOs;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ISkillRepository _repository;

    public SkillsController(ISkillRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetAll()
    {
        var skills = await _repository.GetAllAsync();
        var dtos = skills.Select(s => new SkillDto { Id = s.Id, Name = s.Name });
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateSkillDto dto)
    {
        var skill = new Skill { Name = dto.Name };
        var id = await _repository.AddAsync(skill);
        return CreatedAtAction(nameof(GetAll), new { id }, skill);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteAsync(id);
        return NoContent();
    }
}