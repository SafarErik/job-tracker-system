using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Interface for accessing user-related data.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Retrieves a user by their ID, including their associated skills.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <returns>The user entity with skills populated, or null if not found.</returns>
    Task<ApplicationUser?> GetUserWithSkillsAsync(string userId);
}
