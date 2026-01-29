using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for JobApplication entities.
/// Handles all database operations for job applications.
/// </summary>
public class JobApplicationRepository : IJobApplicationRepository
{
    private readonly ApplicationDbContext _context;

    public JobApplicationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all job applications with related entities.
    /// Use for admin purposes only.
    /// </summary>
    public async Task<IEnumerable<JobApplication>> GetAllAsync()
    {
        return await _context.JobApplications
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .Include(j => j.Document)
            .Include(j => j.PrimaryContact)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all job applications for a specific user.
    /// This is the primary method for user-specific data access.
    /// </summary>
    public async Task<IEnumerable<JobApplication>> GetAllByUserIdAsync(string userId)
    {
        return await _context.JobApplications
            .Where(j => j.UserId == userId)
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .Include(j => j.Document)
            .Include(j => j.PrimaryContact)
            .OrderByDescending(j => j.AppliedAt)
            .ToListAsync();
    }

    public async Task<JobApplication?> GetByIdAsync(int id)
    {
        return await _context.JobApplications
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .Include(j => j.Document)
            .Include(j => j.PrimaryContact)
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