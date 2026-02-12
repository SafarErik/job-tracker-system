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
    Task<JobApplication?> GetByIdAsync(Guid id);

    /// <summary>
    /// Adds a new job application to the repository.
    /// </summary>
    /// <param name="application">The job application entity to add.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddAsync(JobApplication application);

    /// <summary>
    /// Updates an existing job application's information.
    /// </summary>
    /// <param name="application">The job application entity with updated values.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(JobApplication application);

    /// <summary>
    /// Deletes a job application from the repository.
    /// </summary>
    /// <param name="id">The unique identifier of the job application to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id);
    void SetOriginalConcurrencyToken(JobApplication application, Guid token);
}