using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;


public class CompanyRepository : ICompanyRepository
{
    private readonly ApplicationDbContext _context;

    public CompanyRepository(ApplicationDbContext context)
    {
        _context = context;

    }

    public async Task<IEnumerable<Company>> GetAllAsync()
    {
        return await _context.Companies
            .Include(c => c.JobApplications)
            .Include(c => c.Contacts)
            .ToListAsync();
    }

    public async Task<IEnumerable<Company>> GetAllByUserIdAsync(string userId)
    {
        return await _context.Companies
            .Where(c => c.UserId == userId)
            .Include(c => c.JobApplications)
            .Include(c => c.Contacts)
            .ToListAsync();
    }

    public async Task<Company?> GetByIdAsync(Guid id)
    {
        return await _context.Companies
            .Include(c => c.JobApplications)
            .Include(c => c.Contacts)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Guid> AddAsync(Company company)
    {
        await _context.Companies.AddAsync(company);
        await _context.SaveChangesAsync();
        return company.Id;
    }

    public async Task UpdateAsync(Company company)
    {
        _context.Companies.Update(company);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company != null)
        {
            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
        }
    }

}