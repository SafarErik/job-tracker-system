using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

public class JobApplicationRepository : IJobApplicationRepository
{
    private readonly ApplicationDbContext _context;

    public JobApplicationRepository(ApplicationDbContext context)
    {
        _context = context;

    }    

    public async Task<IEnumerable<JobApplication>> GetAllAsync()
    {
        // Include => It will load the skills and the companies besides the jobapplications
        return await _context.JobApplications
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .ToListAsync();
    }

    public async Task<JobApplication?> GetByIdAsync(int id)
    {
        return await _context.JobApplications
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .FirstOrDefaultAsync(j => j.Id == id);

    }

    public async Task AddAsync(JobApplication application)
    {
        await _context.JobApplications.AddAsync(application);
        await _context.SaveChangesAsync();

    }

    public async Task UpdateAsync(JobApplication application)
    {
        _context.JobApplications.Update(application);
        await _context.SaveChangesAsync();

    }

    public async Task DeleteAsync(int id)
    {
        var app = await _context.JobApplications.FindAsync(id);
        if (app != null)
        {
            _context.JobApplications.Remove(app);
            await _context.SaveChangesAsync();

        }

    }


}