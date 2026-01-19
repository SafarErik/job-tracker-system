using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

public interface ISkillRepository
{
    Task<IEnumerable<Skill>> GetAllAsync();
    Task<Skill?> GetByIdAsync(int id);
    Task<int> AddAsync(Skill skill);
    Task UpdateAsync(Skill skill);
    Task DeleteAsync(int id);
}