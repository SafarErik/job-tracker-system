
using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

public interface ICompanyRepository
{
    Task<IEnumerable<Company>> GetAllAsync(); // Gets the whole list of companies
    Task<Company?> GetByIdAsync(int id); // Gives back one company with the given id, if not found gives back null
    Task<int> AddAsync(Company company); // Adds a new company
    Task UpdateAsync(Company company); // Updates an existing company
    Task DeleteAsync(int id); // Deletes a company with the given id


}