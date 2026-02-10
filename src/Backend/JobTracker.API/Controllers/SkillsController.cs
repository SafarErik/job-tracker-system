using Microsoft.AspNetCore.Mvc;
using JobTracker.Core.Interfaces;
using JobTracker.Application.DTOs.Skills;
using JobTracker.Application.Mappers;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController(ISkillRepository repository) : ControllerBase
{
    private readonly ISkillRepository _repository = repository;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetAll()
    {
        var skills = await _repository.GetAllAsync();
        return Ok(skills.Select(SkillMapper.MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SkillDto>> GetById(Guid id)
    {
        var skill = await _repository.GetByIdAsync(id);
        if (skill == null) return NotFound();
        return Ok(SkillMapper.MapToDto(skill));
    }

    [HttpPost]
    public async Task<ActionResult<SkillDto>> Create(CreateSkillDto dto)
    {
        var skill = SkillMapper.MapToEntity(dto);
        var id = await _repository.AddAsync(skill);

        var createdSkill = SkillMapper.MapToDto(skill);
        createdSkill.Id = id;

        return CreatedAtAction(nameof(GetById), new { id }, createdSkill);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var skill = await _repository.GetByIdAsync(id);
        if (skill == null) return NotFound();
        await _repository.DeleteAsync(id);
        return NoContent();
    }
}