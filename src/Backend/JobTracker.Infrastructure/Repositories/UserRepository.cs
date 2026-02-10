using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for User entities.
/// </summary>
public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <inheritdoc/>
    public async Task<ApplicationUser?> GetUserWithSkillsAsync(string userId)
    {
        return await _context.Users
            .Include(u => u.Skills)
            .FirstOrDefaultAsync(u => u.Id == userId);
    }
}
