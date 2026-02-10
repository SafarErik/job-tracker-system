using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for CompanyContact entities.
/// </summary>
public class CompanyContactRepository : ICompanyContactRepository
{
    private readonly ApplicationDbContext _context;

    public CompanyContactRepository(ApplicationDbContext context) => _context = context;

    /// <inheritdoc/>
    public async Task<IEnumerable<CompanyContact>> GetByCompanyIdAsync(Guid companyId) =>
        await _context.CompanyContacts
            .AsNoTracking()
            .Where(c => c.CompanyId == companyId)
            .OrderBy(c => c.Name)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<CompanyContact?> GetByIdAsync(Guid id) =>
        await _context.CompanyContacts.FindAsync(id);

    /// <inheritdoc/>
    public async Task<Guid> AddAsync(CompanyContact contact)
    {
        await _context.CompanyContacts.AddAsync(contact);
        await _context.SaveChangesAsync();
        return contact.Id;
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(CompanyContact contact)
    {
        _context.CompanyContacts.Update(contact);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id) =>
        await _context.CompanyContacts
            .Where(c => c.Id == id)
            .ExecuteDeleteAsync();
}
