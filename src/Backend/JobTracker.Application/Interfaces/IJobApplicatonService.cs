using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Application.DTOs.AI;

public interface IJobApplicationService
{
    Task<IEnumerable<JobApplicationDto>> GetUserJobsAsync(string userId);
    Task<JobApplicationDto?> GetJobByIdAsync(Guid id, string userId);
    Task<JobApplicationDto> CreateJobAsync(CreateJobApplicationDto dto, string userId);
    Task<bool> UpdateJobAsync(Guid id, UpdateJobApplicationDto dto, string userId);
    Task<bool> DeleteJobAsync(Guid id, string userId);

    Task<string> GenerateCoverLetterAsync(Guid jobId, string userId);

    /// <summary>
    /// Generates an optimized version of the resume tailored for a specific job.
    /// </summary>
    Task<string> OptimizeResumeAsync(Guid jobId, string userId);

    /// <summary>
    /// Triggers AI analysis of a job application against the user's master resume.
    /// Updates the job application with match score and AI feedback.
    /// </summary>
    /// <param name="id">Job application ID</param>
    /// <param name="userId">Current user's ID</param>
    /// <returns>Updated job application DTO with AI analysis results</returns>
    Task<JobApplicationDto> TriggerAIAnalysisAsync(Guid id, string userId);
}