using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for JobApplication entities.
/// Handles all database operations for job applications.
/// </summary>
public class JobApplicationRepository : IJobApplicationRepository
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<JobApplicationRepository> _logger;

    public JobApplicationRepository(ApplicationDbContext context, ILogger<JobApplicationRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<JobApplication>> GetAllAsync()
    {
        return await _context.JobApplications
            .AsNoTracking() // We don't follow the changes --> Excellent for reading
            .AsSplitQuery() // Separate SQL queries for relations
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .Include(j => j.Document)
            .Include(j => j.PrimaryContact)
            .Include(j => j.TimelineEvents)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<JobApplication>> GetAllByUserIdAsync(string userId)
    {
        return await _context.JobApplications
            .AsNoTracking()
            .AsSplitQuery()
            .Where(j => j.UserId == userId)
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .Include(j => j.Document)
            .Include(j => j.PrimaryContact)
             .Include(j => j.TimelineEvents)
            .OrderByDescending(j => j.AppliedAt)
            .ToListAsync();
    }

    /// <inheritdoc/>
    public async Task<JobApplication?> GetByIdAsync(Guid id)
    {
        return await _context.JobApplications
            .AsSplitQuery()
            .Include(j => j.Company)
            .Include(j => j.Skills)
            .Include(j => j.Document)
            .Include(j => j.PrimaryContact)
            .Include(j => j.TimelineEvents)
            .FirstOrDefaultAsync(j => j.Id == id);
    }

    /// <inheritdoc/>
    public async Task AddAsync(JobApplication application)
    {
        await _context.JobApplications.AddAsync(application);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(JobApplication application)
    {
        try
        {
            _context.JobApplications.Update(application);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogWarning(ex, "Concurrency conflict for JobApplication {Id}", application.Id);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id)
    {
        var rowsAffected = await _context.JobApplications
           .Where(j => j.Id == id)
           .ExecuteDeleteAsync();

        if (rowsAffected == 0)
        {
            _logger.LogWarning("Attempted to delete JobApplication {Id}, but it was not found.", id);
        }
    }
}
