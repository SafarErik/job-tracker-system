using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.DTOs.AI;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Application.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
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
    private readonly IDocumentTextExtractor _textExtractor;
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<JobApplicationService> _logger;

    private const string MissingAiInputsMessage = "Please upload a Master Resume and add skills to your profile first.";

    public JobApplicationService(
        IJobApplicationRepository jobRepository,
        IDocumentRepository documentRepository,
        IAIService aiService,
        IDocumentTextExtractor textExtractor,
        ApplicationDbContext dbContext,
        ILogger<JobApplicationService> logger)
    {
        _jobRepository = jobRepository;
        _documentRepository = documentRepository;
        _aiService = aiService;
        _textExtractor = textExtractor;
        _dbContext = dbContext;
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

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var filePath = Path.Combine(uploadsFolder, masterResume.FileName);
        var resumeText = await _textExtractor.ExtractTextAsync(filePath);

        if (string.IsNullOrWhiteSpace(resumeText))
        {
            resumeText = $"Resume: {masterResume.OriginalFileName}\n\nNote: Full text extraction failed. Using metadata only.";
        }


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

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var filePath = Path.Combine(uploadsFolder, masterResume.FileName);
        var resumeText = await _textExtractor.ExtractTextAsync(filePath);

        if (string.IsNullOrWhiteSpace(resumeText))
        {
            resumeText = $"Resume: {masterResume.OriginalFileName}\n\nNote: Full text extraction failed. Using metadata only.";
        }


        return await _aiService.OptimizeResumeAsync(jobDescription, resumeText);
    }

    public async Task<JobApplicationDto> TriggerAIAnalysisAsync(Guid id, string userId)
    {
        _logger.LogInformation("Starting AI analysis for job application {JobId}", id);

        JobApplication application;
        string jobDescription;
        string skillsList;
        string resumeText;

        try
        {
            (application, jobDescription, skillsList, resumeText) = await LoadAiInputsAsync(id, userId);
        }
        catch (InvalidOperationException)
        {
            var existing = await _jobRepository.GetByIdAsync(id);
            if (existing == null)
            {
                throw new KeyNotFoundException($"Job application {id} not found");
            }

            existing.AiFeedback = MissingAiInputsMessage;
            existing.MatchScore = 0;
            await _jobRepository.UpdateAsync(existing);
            return MapToDto(existing);
        }

        var analysisResult = await _aiService.AnalyzeJobAsync(jobDescription, skillsList, resumeText);

        ApplyAnalysisResult(application, analysisResult);

        // 7. Save to database
        await _jobRepository.UpdateAsync(application);

        _logger.LogInformation("AI analysis complete for job application {JobId}. Match score: {MatchScore}",
            id, application.MatchScore);

        // 8. Return mapped DTO
        var dto = MapToDto(application);
        dto.AiGoodPoints = analysisResult.GoodPoints;
        dto.AiGaps = analysisResult.Gaps;
        dto.AiAdvice = analysisResult.Advice;
        return dto;
    }

    public async Task<AiGeneratedAssetsDto> GenerateAssetsAsync(Guid jobId, string userId)
    {
        _logger.LogInformation("Generating tailored assets for job application {JobId}", jobId);

        var (application, jobDescription, skillsList, resumeText) = await LoadAiInputsAsync(jobId, userId);

        var analysisResult = await _aiService.AnalyzeJobAsync(jobDescription, skillsList, resumeText);

        if (!analysisResult.Success)
        {
            throw new InvalidOperationException(analysisResult.ErrorMessage ?? "AI generation failed");
        }

        ApplyAnalysisResult(application, analysisResult);
        await _jobRepository.UpdateAsync(application);

        return new AiGeneratedAssetsDto
        {
            MatchScore = analysisResult.MatchScore,
            GoodPoints = analysisResult.GoodPoints,
            Gaps = analysisResult.Gaps,
            Advice = analysisResult.Advice,
            AiFeedback = application.AiFeedback ?? string.Empty,
            TailoredResume = analysisResult.TailoredResume ?? string.Empty,
            TailoredCoverLetter = analysisResult.TailoredCoverLetter ?? string.Empty
        };
    }

    private async Task<(JobApplication Application, string JobDescription, string SkillsList, string ResumeText)> LoadAiInputsAsync(Guid jobId, string userId)
    {
        var application = await _jobRepository.GetByIdAsync(jobId);
        if (application == null)
        {
            throw new KeyNotFoundException($"Job application {jobId} not found");
        }

        if (application.UserId != userId)
        {
            throw new UnauthorizedAccessException("You do not have access to this job application");
        }

        var user = await _dbContext.Users
            .Include(u => u.Skills)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found");
        }

        var skills = user.Skills
            .Select(s => s.Name)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToList();

        if (skills.Count == 0)
        {
            throw new InvalidOperationException(MissingAiInputsMessage);
        }

        var userDocuments = await _documentRepository.GetAllByUserIdAsync(userId);
        var masterResume = userDocuments.FirstOrDefault(d => d.IsMaster && d.Type == DocumentType.Resume);

        if (masterResume == null)
        {
            throw new InvalidOperationException(MissingAiInputsMessage);
        }

        var jobDescription = application.Description;
        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            throw new InvalidOperationException(MissingAiInputsMessage);
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        var filePath = Path.Combine(uploadsFolder, masterResume.FileName);
        var resumeText = await _textExtractor.ExtractTextAsync(filePath);

        if (string.IsNullOrWhiteSpace(resumeText))
        {
            _logger.LogWarning("Text extraction failed for resume {ResumeId}", masterResume.Id);
            resumeText = $"Resume: {masterResume.OriginalFileName}\n\nNote: Full text extraction failed. Using metadata only.";
        }

        var skillsList = string.Join(", ", skills);

        return (application, jobDescription, skillsList, resumeText);
    }

    private static string BuildAiFeedback(AiAnalysisResult analysisResult)
    {
        var feedbackBuilder = new System.Text.StringBuilder();

        if (analysisResult.GoodPoints.Count > 0)
        {
            feedbackBuilder.AppendLine("## Good Points");
            foreach (var point in analysisResult.GoodPoints)
            {
                feedbackBuilder.AppendLine($"- {point}");
            }
            feedbackBuilder.AppendLine();
        }

        if (analysisResult.Gaps.Count > 0)
        {
            feedbackBuilder.AppendLine("## Gaps");
            foreach (var gap in analysisResult.Gaps)
            {
                feedbackBuilder.AppendLine($"- {gap}");
            }
            feedbackBuilder.AppendLine();
        }

        if (analysisResult.Advice.Count > 0)
        {
            feedbackBuilder.AppendLine("## Strategic Advice");
            foreach (var advice in analysisResult.Advice)
            {
                feedbackBuilder.AppendLine($"- {advice}");
            }
        }

        if (feedbackBuilder.Length == 0 && !string.IsNullOrWhiteSpace(analysisResult.StrategicAdvice))
        {
            feedbackBuilder.AppendLine(analysisResult.StrategicAdvice);
        }

        return feedbackBuilder.ToString().Trim();
    }

    private static void ApplyAnalysisResult(JobApplication application, AiAnalysisResult analysisResult)
    {
        if (analysisResult.Success)
        {
            application.MatchScore = analysisResult.MatchScore;
            application.AiFeedback = BuildAiFeedback(analysisResult);

            if (!string.IsNullOrWhiteSpace(analysisResult.TailoredCoverLetter))
            {
                application.GeneratedCoverLetter = analysisResult.TailoredCoverLetter;
            }
        }
        else
        {
            application.AiFeedback = $"Analysis failed: {analysisResult.ErrorMessage}";
        }
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
            AiGoodPoints = new List<string>(),
            AiGaps = new List<string>(),
            AiAdvice = new List<string>(),
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
