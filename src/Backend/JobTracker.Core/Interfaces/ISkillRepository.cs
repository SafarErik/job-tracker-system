using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

public interface ISkillRepository
{
    Task<IEnumerable<Skill>> GetAllAsync();
    Task<Skill?> GetByIdAsync(Guid id);
    Task<Guid> AddAsync(Skill skill);
    Task UpdateAsync(Skill skill);
    Task DeleteAsync(Guid id);
}