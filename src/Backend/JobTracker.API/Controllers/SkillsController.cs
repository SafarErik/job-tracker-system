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

    [HttpGet("{id}")]
    public async Task<ActionResult<SkillDto>> GetById(int id)
    {
        var skill = await _repository.GetByIdAsync(id);
        if (skill == null)
        {
            return NotFound();
        }
        return Ok(new SkillDto { Id = skill.Id, Name = skill.Name });
    }

    [HttpPost]
    public async Task<ActionResult<SkillDto>> Create(CreateSkillDto dto)
    {
        var skill = new Skill { Name = dto.Name };
        var id = await _repository.AddAsync(skill);
        var createdSkill = new SkillDto { Id = id, Name = skill.Name };
        return CreatedAtAction(nameof(GetById), new { id }, createdSkill);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var skill = await _repository.GetByIdAsync(id);
        if (skill == null)
        {
            return NotFound();
        }
        await _repository.DeleteAsync(id);
        return NoContent();
    }
}