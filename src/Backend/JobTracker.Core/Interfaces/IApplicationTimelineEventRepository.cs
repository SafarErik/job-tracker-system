using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Repository interface for ApplicationTimelineEvent entities.
/// Provides data access methods for tracking status changes and events in the application lifecycle.
/// </summary>
public interface IApplicationTimelineEventRepository
{
    /// <summary>
    /// Retrieves all events associated with a specific job application.
    /// </summary>
    /// <param name="applicationId">The unique identifier of the job application.</param>
    /// <returns>A collection of timeline events for the application.</returns>
    Task<IEnumerable<ApplicationTimelineEvent>> GetByApplicationIdAsync(Guid applicationId);

    /// <summary>
    /// Retrieves a single timeline event by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the event.</param>
    /// <returns>The event if found; otherwise, null.</returns>
    Task<ApplicationTimelineEvent?> GetByIdAsync(Guid id);

    /// <summary>
    /// Adds a new timeline event to the repository.
    /// </summary>
    /// <param name="timelineEvent">The event entity to add.</param>
    /// <returns>The unique identifier of the newly created event.</returns>
    Task<Guid> AddAsync(ApplicationTimelineEvent timelineEvent);

    /// <summary>
    /// Updates an existing timeline event.
    /// </summary>
    /// <param name="timelineEvent">The event entity with updated values.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(ApplicationTimelineEvent timelineEvent);

    /// <summary>
    /// Deletes a timeline event from the repository.
    /// </summary>
    /// <param name="id">The unique identifier of the event to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id);
}
