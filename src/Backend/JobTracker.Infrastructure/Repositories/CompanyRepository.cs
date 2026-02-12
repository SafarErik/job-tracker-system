using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Company entities.
/// </summary>
public class CompanyRepository : ICompanyRepository
{
    private readonly ApplicationDbContext _context;

    public CompanyRepository(ApplicationDbContext context) => _context = context;

    /// <inheritdoc/>
    public async Task<IEnumerable<Company>> GetAllAsync() =>
        await _context.Companies
            .AsNoTracking()
            .Include(c => c.JobApplications)
            .Include(c => c.Contacts)
            .Include(c => c.TechStack)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<IEnumerable<Company>> GetAllByUserIdAsync(string userId) =>
        await _context.Companies
            .AsNoTracking()
            .Where(c => c.UserId == userId)
            .Include(c => c.JobApplications)
            .Include(c => c.Contacts)
            .Include(c => c.TechStack)
            .OrderBy(c => c.Name)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<Company?> GetByIdAsync(Guid id) =>
        await _context.Companies
            .Include(c => c.JobApplications)
            .Include(c => c.Contacts)
            .Include(c => c.TechStack)
            .FirstOrDefaultAsync(c => c.Id == id);

    /// <inheritdoc/>
    public async Task<Guid> AddAsync(Company company)
    {
        await _context.Companies.AddAsync(company);
        await _context.SaveChangesAsync();
        return company.Id;
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(Company company)
    {
        _context.Companies.Update(company);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id) =>
        await _context.Companies
            .Where(c => c.Id == id)
            .ExecuteDeleteAsync();
}