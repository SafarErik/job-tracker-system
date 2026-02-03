using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.DTOs.AI;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace JobTracker.Infrastructure.Services;

/// <summary>
/// Service implementation for job application business logic.
/// Orchestrates AI analysis and data persistence operations.
/// </summary>
public class JobApplicationService : IJobApplicationService
{
    private readonly IJobApplicationRepository _jobRepository;
    private readonly IDocumentRepository _documentRepository;
    private readonly IAIService _aiService;
    private readonly ILogger<JobApplicationService> _logger;

    public JobApplicationService(
        IJobApplicationRepository jobRepository,
        IDocumentRepository documentRepository,
        IAIService aiService,
        ILogger<JobApplicationService> logger)
    {
        _jobRepository = jobRepository;
        _documentRepository = documentRepository;
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<IEnumerable<JobApplicationDto>> GetUserJobsAsync(string userId)
    {
        var applications = await _jobRepository.GetAllByUserIdAsync(userId);
        return applications.Select(MapToDto);
    }

    public async Task<JobApplicationDto?> GetJobByIdAsync(Guid id, string userId)
    {
        var app = await _jobRepository.GetByIdAsync(id);
        if (app == null || app.UserId != userId)
            return null;

        return MapToDto(app);
    }

    public Task<JobApplicationDto> CreateJobAsync(CreateJobApplicationDto dto, string userId)
    {
        // Delegate to controller for now - this is a placeholder
        throw new NotImplementedException("Creation is handled directly by the controller");
    }

    public Task<bool> UpdateJobAsync(Guid id, UpdateJobApplicationDto dto, string userId)
    {
        // Delegate to controller for now - this is a placeholder
        throw new NotImplementedException("Updates are handled directly by the controller");
    }

    public Task<bool> DeleteJobAsync(Guid id, string userId)
    {
        // Delegate to controller for now - this is a placeholder
        throw new NotImplementedException("Deletion is handled directly by the controller");
    }

    public async Task<string> GenerateCoverLetterAsync(Guid jobId, string userId)
    {
        _logger.LogInformation("Generating cover letter for job application {JobId}", jobId);

        var application = await _jobRepository.GetByIdAsync(jobId);
        if (application == null || application.UserId != userId)
        {
            throw new KeyNotFoundException($"Job application {jobId} not found");
        }

        var userDocuments = await _documentRepository.GetAllByUserIdAsync(userId);
        var masterResume = userDocuments.FirstOrDefault(d => d.IsMaster && d.Type == DocumentType.Resume);

        if (masterResume == null)
        {
            return "No Master Resume found. Please upload a Master Resume to enable cover letter generation.";
        }

        var jobDescription = application.Description;
        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            return "No job description available. Please add a job description to enable cover letter generation.";
        }

        var resumeText = $"Resume: {masterResume.OriginalFileName}\n\nNote: Full text extraction pending.";

        var companyName = application.Company?.Name ?? "the hiring company";
        var position = application.Position;

        var coverLetter = await _aiService.GenerateCoverLetterAsync(jobDescription, resumeText, companyName, position);

        // Optionally save to application
        application.GeneratedCoverLetter = coverLetter;
        await _jobRepository.UpdateAsync(application);

        return coverLetter;
    }

    public async Task<string> OptimizeResumeAsync(Guid jobId, string userId)
    {
        _logger.LogInformation("Optimizing resume for job application {JobId}", jobId);

        var application = await _jobRepository.GetByIdAsync(jobId);
        if (application == null || application.UserId != userId)
        {
            throw new KeyNotFoundException($"Job application {jobId} not found");
        }

        var userDocuments = await _documentRepository.GetAllByUserIdAsync(userId);
        var masterResume = userDocuments.FirstOrDefault(d => d.IsMaster && d.Type == DocumentType.Resume);

        if (masterResume == null)
        {
            return "No Master Resume found. Please upload a Master Resume to enable optimization.";
        }

        var jobDescription = application.Description;
        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            return "No job description available. Please add a job description to enable optimization.";
        }

        var resumeText = $"Resume: {masterResume.OriginalFileName}\n\nNote: Full text extraction pending.";

        return await _aiService.OptimizeResumeAsync(jobDescription, resumeText);
    }

    public async Task<JobApplicationDto> TriggerAIAnalysisAsync(Guid id, string userId)
    {
        _logger.LogInformation("Starting AI analysis for job application {JobId}", id);

        // 1. Get the job application
        var application = await _jobRepository.GetByIdAsync(id);
        if (application == null)
        {
            throw new KeyNotFoundException($"Job application {id} not found");
        }

        if (application.UserId != userId)
        {
            throw new UnauthorizedAccessException("You do not have access to this job application");
        }

        // 2. Get the user's master resume
        var userDocuments = await _documentRepository.GetAllByUserIdAsync(userId);
        var masterResume = userDocuments.FirstOrDefault(d => d.IsMaster && d.Type == DocumentType.Resume);

        if (masterResume == null)
        {
            _logger.LogWarning("No master resume found for user {UserId}", userId);

            // Update with error feedback
            application.AiFeedback = "No Master Resume found. Please upload and set a Master Resume in your Documents to enable AI analysis.";
            application.MatchScore = 0;
            await _jobRepository.UpdateAsync(application);

            return MapToDto(application);
        }

        // 3. Get job description
        var jobDescription = application.Description;
        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            application.AiFeedback = "No job description available. Please add a job description to enable AI analysis.";
            application.MatchScore = 0;
            await _jobRepository.UpdateAsync(application);

            return MapToDto(application);
        }

        // 4. For now, we use the original filename as a placeholder for resume text
        // In a real implementation, you'd extract text from the PDF/DOC file
        // TODO: Implement document text extraction (PDF/DOC parsing)
        var resumeText = $"Resume: {masterResume.OriginalFileName}\n\nNote: Full text extraction from documents is pending implementation.";

        // Check if we have actual text content (future: store extracted text in Document entity)
        _logger.LogInformation("Analyzing job application {JobId} against resume {ResumeId}", id, masterResume.Id);

        // 5. Call AI service
        var analysisResult = await _aiService.AnalyzeJobAsync(jobDescription, resumeText);

        // 6. Update job application with results
        if (analysisResult.Success)
        {
            application.MatchScore = analysisResult.MatchScore;

            // Combine gap analysis and strategic advice into AI feedback
            var feedbackBuilder = new System.Text.StringBuilder();

            if (!string.IsNullOrEmpty(analysisResult.GapAnalysis))
            {
                feedbackBuilder.AppendLine("## Gap Analysis");
                feedbackBuilder.AppendLine(analysisResult.GapAnalysis);
                feedbackBuilder.AppendLine();
            }

            if (analysisResult.MissingSkills?.Count > 0)
            {
                feedbackBuilder.AppendLine("## Missing Skills");
                foreach (var skill in analysisResult.MissingSkills)
                {
                    feedbackBuilder.AppendLine($"- {skill}");
                }
                feedbackBuilder.AppendLine();
            }

            if (!string.IsNullOrEmpty(analysisResult.StrategicAdvice))
            {
                feedbackBuilder.AppendLine("## Strategic Advice");
                feedbackBuilder.AppendLine(analysisResult.StrategicAdvice);
            }

            application.AiFeedback = feedbackBuilder.ToString().Trim();
        }
        else
        {
            application.AiFeedback = $"Analysis failed: {analysisResult.ErrorMessage}";
            // Keep existing match score on failure
        }

        // 7. Save to database
        await _jobRepository.UpdateAsync(application);

        _logger.LogInformation("AI analysis complete for job application {JobId}. Match score: {MatchScore}",
            id, application.MatchScore);

        // 8. Return mapped DTO
        return MapToDto(application);
    }

    private static JobApplicationDto MapToDto(JobApplication app)
    {
        return new JobApplicationDto
        {
            Id = app.Id,
            Position = app.Position,
            JobUrl = app.JobUrl,
            Description = app.Description,
            GeneratedCoverLetter = app.GeneratedCoverLetter,
            AiFeedback = app.AiFeedback,
            MatchScore = app.MatchScore,
            AppliedAt = app.AppliedAt,
            Status = app.Status,
            JobType = app.JobType,
            WorkplaceType = app.WorkplaceType,
            Priority = app.Priority,
            SalaryOffer = app.SalaryOffer,
            CompanyId = app.CompanyId,
            CompanyName = app.Company?.Name ?? "Unknown Company",
            DocumentId = app.DocumentId,
            DocumentName = app.Document?.OriginalFileName,
            Skills = app.Skills?.Select(s => s.Name).ToList() ?? new List<string>(),
            PrimaryContact = app.PrimaryContact != null ? new CompanyContactDto
            {
                Id = app.PrimaryContact.Id,
                Name = app.PrimaryContact.Name,
                Email = app.PrimaryContact.Email,
                LinkedIn = app.PrimaryContact.LinkedIn,
                Role = app.PrimaryContact.Role
            } : null,
            RowVersion = app.RowVersion
        };
    }
}
