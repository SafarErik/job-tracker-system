using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Repository interface for CompanyContact entities.
/// Provides data access methods for managing contact persons at companies.
/// </summary>
public interface ICompanyContactRepository
{
    /// <summary>
    /// Retrieves all contacts associated with a specific company.
    /// </summary>
    /// <param name="companyId">The unique identifier of the company.</param>
    /// <returns>A collection of contacts for the company.</returns>
    Task<IEnumerable<CompanyContact>> GetByCompanyIdAsync(Guid companyId);

    /// <summary>
    /// Retrieves a single company contact by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the contact.</param>
    /// <returns>The contact if found; otherwise, null.</returns>
    Task<CompanyContact?> GetByIdAsync(Guid id);

    /// <summary>
    /// Adds a new contact associated with a company.
    /// </summary>
    /// <param name="contact">The contact entity to add.</param>
    /// <returns>The unique identifier of the newly created contact.</returns>
    Task<Guid> AddAsync(CompanyContact contact);

    /// <summary>
    /// Updates an existing contact's information.
    /// </summary>
    /// <param name="contact">The contact entity with updated values.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(CompanyContact contact);

    /// <summary>
    /// Deletes a contact from the repository.
    /// </summary>
    /// <param name="id">The unique identifier of the contact to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id);
}
