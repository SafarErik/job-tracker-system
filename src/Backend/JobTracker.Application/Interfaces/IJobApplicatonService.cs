using JobTracker.Application.DTOs.JobApplications;

public interface IJobApplicationService
{
    Task<IEnumerable<JobApplicationDto>> GetUserJobsAsync(string userId);
    Task<JobApplicationDto?> GetJobByIdAsync(Guid id, string userId);
    Task<JobApplicationDto> CreateJobAsync(CreateJobApplicationDto dto, string userId);
    Task<bool> UpdateJobAsync(Guid id, UpdateJobApplicationDto dto, string userId);
    Task<bool> DeleteJobAsync(Guid id, string userId);

    Task<string> GenerateCoverLetterAsync(Guid jobId, string userId);
}