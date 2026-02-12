using JobTracker.Application.DTOs.Skills;
using JobTracker.Core.Entities;

namespace JobTracker.Application.Mappers;

/// <summary>
/// Maps between <see cref="Skill"/> entities and skill DTOs.
/// </summary>
public static class SkillMapper
{
    public static SkillDto MapToDto(Skill skill) => new()
    {
        Id = skill.Id,
        Name = skill.Name,
        Category = skill.Category
    };

    public static Skill MapToEntity(CreateSkillDto dto) => new()
    {
        Name = dto.Name,
        NormalizedName = dto.Name.ToUpperInvariant(),
        Category = dto.Category
    };
}
