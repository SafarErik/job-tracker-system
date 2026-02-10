using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Skill entities.
/// </summary>
public class SkillRepository : ISkillRepository
{
    private readonly ApplicationDbContext _context;

    public SkillRepository(ApplicationDbContext context) => _context = context;

    /// <inheritdoc/>
    public async Task<IEnumerable<Skill>> GetAllAsync() =>
        await _context.Skills
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<Skill?> GetByIdAsync(Guid id) =>
        await _context.Skills.FindAsync(id);

    /// <inheritdoc/>
    public async Task<Guid> AddAsync(Skill skill)
    {
        await _context.Skills.AddAsync(skill);
        await _context.SaveChangesAsync();
        return skill.Id;
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(Skill skill)
    {
        _context.Skills.Update(skill);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id) =>
        await _context.Skills
            .Where(s => s.Id == id)
            .ExecuteDeleteAsync();
}