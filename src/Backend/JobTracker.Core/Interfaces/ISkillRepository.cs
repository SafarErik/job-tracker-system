using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Repository interface for Skill entities.
/// Provides data access methods for managing professional skills.
/// </summary>
public interface ISkillRepository
{
    /// <summary>
    /// Retrieves all skills available in the system.
    /// </summary>
    /// <returns>A collection of all skills.</returns>
    Task<IEnumerable<Skill>> GetAllAsync();

    /// <summary>
    /// Retrieves a skill by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the skill.</param>
    /// <returns>The skill if found; otherwise, null.</returns>
    Task<Skill?> GetByIdAsync(Guid id);

    /// <summary>
    /// Adds a new skill to the repository.
    /// </summary>
    /// <param name="skill">The skill entity to add.</param>
    /// <returns>The unique identifier of the newly created skill.</returns>
    Task<Guid> AddAsync(Skill skill);

    /// <summary>
    /// Updates an existing skill's information.
    /// </summary>
    /// <param name="skill">The skill entity with updated values.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Skill skill);

    /// <summary>
    /// Deletes a skill from the repository.
    /// </summary>
    /// <param name="id">The unique identifier of the skill to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id);
}