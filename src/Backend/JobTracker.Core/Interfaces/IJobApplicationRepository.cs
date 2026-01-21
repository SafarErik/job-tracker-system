using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Repository interface for JobApplication entities.
/// Provides data access methods for job application management.
/// </summary>
public interface IJobApplicationRepository
{
    /// <summary>
    /// Gets all job applications (admin use only)
    /// </summary>
    Task<IEnumerable<JobApplication>> GetAllAsync();

    /// <summary>
    /// Gets all job applications for a specific user
    /// </summary>
    /// <param name="userId">The user's ID</param>
    Task<IEnumerable<JobApplication>> GetAllByUserIdAsync(string userId);

    /// <summary>
    /// Gets a single job application by ID
    /// </summary>
    Task<JobApplication?> GetByIdAsync(int id);

    /// <summary>
    /// Adds a new job application
    /// </summary>
    Task AddAsync(JobApplication application);

    /// <summary>
    /// Updates an existing job application
    /// </summary>
    Task UpdateAsync(JobApplication application);

    /// <summary>
    /// Deletes a job application
    /// </summary>
    Task DeleteAsync(int id);
}