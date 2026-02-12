using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Repository interface for Company entities.
/// Provides data access methods for managing companies and their associated data.
/// </summary>
public interface ICompanyRepository
{
    /// <summary>
    /// Retrieves all companies in the system.
    /// </summary>
    /// <returns>A collection of all companies.</returns>
    Task<IEnumerable<Company>> GetAllAsync();

    /// <summary>
    /// Retrieves all companies associated with a specific user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <returns>A collection of companies belonging to the user.</returns>
    Task<IEnumerable<Company>> GetAllByUserIdAsync(string userId);

    /// <summary>
    /// Retrieves a company by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the company.</param>
    /// <returns>The company if found; otherwise, null.</returns>
    Task<Company?> GetByIdAsync(Guid id);

    /// <summary>
    /// Adds a new company to the repository.
    /// </summary>
    /// <param name="company">The company entity to add.</param>
    /// <returns>The unique identifier of the newly created company.</returns>
    Task<Guid> AddAsync(Company company);

    /// <summary>
    /// Updates an existing company's information.
    /// </summary>
    /// <param name="company">The company entity with updated values.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(Company company);

    /// <summary>
    /// Deletes a company from the repository.
    /// </summary>
    /// <param name="id">The unique identifier of the company to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id);
}