using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

public class SkillRepository : ISkillRepository
{
    private readonly ApplicationDbContext _context;

    public SkillRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Skill>> GetAllAsync()
    {
        return await _context.Skills.ToListAsync();
    }

    public async Task<Skill?> GetByIdAsync(Guid id)
    {
        return await _context.Skills.FindAsync(id);
    }

    public async Task<Guid> AddAsync(Skill skill)
    {
        await _context.Skills.AddAsync(skill);
        await _context.SaveChangesAsync();
        return skill.Id;
    }

    public async Task UpdateAsync(Skill skill)
    {
        _context.Skills.Update(skill);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var skill = await _context.Skills.FindAsync(id);
        if (skill != null)
        {
            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
        }
    }
}