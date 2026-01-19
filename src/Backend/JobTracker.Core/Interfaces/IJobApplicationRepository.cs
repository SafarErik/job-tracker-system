using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

public interface IJobApplicationRepository
{
    Task<IEnumerable<JobApplication>> GetAllAsync(); // Gets the whole list of jobapplications
    Task<JobApplication?> GetByIdAsync(int id); // Gives back one jobapplication with the given id, if not found gives back null
    Task AddAsync(JobApplication application); // Adds a new jobapplication
    Task UpdateAsync(JobApplication application); // Updates an existing jobapplication
    Task DeleteAsync(int id); // Deletes a jobapplication with the given id


}