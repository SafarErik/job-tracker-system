
using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

public interface ICompanyRepository
{
    Task<IEnumerable<Company>> GetAllAsync(); // Gets the whole list of companies
    Task<IEnumerable<Company>> GetAllByUserIdAsync(string userId); // Gets all companies for a specific user
    Task<Company?> GetByIdAsync(Guid id); // Gives back one company with the given id, if not found gives back null
    Task<Guid> AddAsync(Company company); // Adds a new company
    Task UpdateAsync(Company company); // Updates an existing company
    Task DeleteAsync(Guid id); // Deletes a company with the given id


}