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
    private readonly string _uploadsPath;

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

        // Use BaseDirectory for more reliable path resolution in different hosting environments
        _uploadsPath = Path.Combine(AppContext.BaseDirectory, "uploads");
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

        // 1. Validation & Data Loading
        var application = await _jobRepository.GetByIdAsync(jobId);
        if (application == null || application.UserId != userId)
        {
            throw new KeyNotFoundException($"Job application {jobId} not found");
        }

        if (string.IsNullOrWhiteSpace(application.Description))
        {
            return "No job description available. Please add a job description to enable cover letter generation.";
        }

        var masterResume = await GetMasterResumeAsync(userId);
        if (masterResume == null)
        {
            return "No Master Resume found. Please upload a Master Resume to enable cover letter generation.";
        }

        // 2. Text Extraction
        var resumeText = await ExtractResumeTextAsync(masterResume);

        // 3. AI Generation
        var companyName = application.Company?.Name ?? "the hiring company";

        var coverLetter = await _aiService.GenerateCoverLetterAsync(application.Description, resumeText, companyName, application.Position);

        // 4. Persistence
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

        if (string.IsNullOrWhiteSpace(application.Description))
        {
            return "No job description available. Please add a job description to enable optimization.";
        }

        var masterResume = await GetMasterResumeAsync(userId);
        if (masterResume == null)
        {
            return "No Master Resume found. Please upload a Master Resume to enable optimization.";
        }

        var resumeText = await ExtractResumeTextAsync(masterResume);

        return await _aiService.OptimizeResumeAsync(application.Description, resumeText);
    }

    public async Task<JobApplicationDto> TriggerAIAnalysisAsync(Guid id, string userId)
    {
        _logger.LogInformation("Starting AI analysis for job application {JobId}", id);

        try
        {
            // 1. Load Inputs
            var (application, jobDescription, skillsList, resumeText) = await LoadAiInputsAsync(id, userId);

            // 2. Execute AI Analysis
            var analysisResult = await _aiService.AnalyzeJobAsync(jobDescription, skillsList, resumeText);

            // 3. Apply Logic
            ApplyAnalysisResult(application, analysisResult);

            // 4. Save
            await _jobRepository.UpdateAsync(application);

            _logger.LogInformation("AI analysis complete for job application {JobId}. Match score: {MatchScore}",
                id, application.MatchScore);

            // 5. Return DTO
            var dto = MapToDto(application);
            // Enrich DTO with transient analysis results (not all stored in DB)
            dto.AiGoodPoints = analysisResult.GoodPoints;
            dto.AiGaps = analysisResult.Gaps;
            dto.AiAdvice = analysisResult.Advice;

            return dto;
        }
        catch (InvalidOperationException ex) when (ex.Message == MissingAiInputsMessage)
        {
            // Specialized handling for business rule violations (missing inputs)
            // We return the application with the error message in the feedback field
            // This prevents the UI from just showing a generic error toast
            return await HandleAnalysisErrorAsync(id, MissingAiInputsMessage);
        }
    }

    public async Task<AiGeneratedAssetsDto> GenerateAssetsAsync(Guid jobId, string userId)
    {
        _logger.LogInformation("Generating tailored assets for job application {JobId}", jobId);

        var (application, jobDescription, skillsList, resumeText) = await LoadAiInputsAsync(jobId, userId);

        var analysisResult = await _aiService.AnalyzeJobAsync(jobDescription, skillsList, resumeText);

        if (!analysisResult.Success)
        {
            // This is an external service failure
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

    /// <summary>
    /// Handles valid business failures by updating the entity with a feedback message.
    /// </summary>
    private async Task<JobApplicationDto> HandleAnalysisErrorAsync(Guid id, string feedbackMessage)
    {
        var existing = await _jobRepository.GetByIdAsync(id);
        if (existing == null) throw new KeyNotFoundException($"Job application {id} not found");

        existing.AiFeedback = feedbackMessage;
        existing.MatchScore = 0;
        await _jobRepository.UpdateAsync(existing);

        return MapToDto(existing);
    }

    private async Task<(JobApplication Application, string JobDescription, string SkillsList, string ResumeText)> LoadAiInputsAsync(Guid jobId, string userId)
    {
        // 1. Load Application
        var application = await _jobRepository.GetByIdAsync(jobId);
        if (application == null) throw new KeyNotFoundException($"Job application {jobId} not found");
        if (application.UserId != userId) throw new UnauthorizedAccessException("You do not have access to this job application");
        if (string.IsNullOrWhiteSpace(application.Description)) throw new InvalidOperationException(MissingAiInputsMessage);

        // 2. Load User Skills
        var user = await _dbContext.Users.Include(u => u.Skills).FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) throw new UnauthorizedAccessException("User not found");

        var skills = user.Skills.Select(s => s.Name).Where(name => !string.IsNullOrWhiteSpace(name)).ToList();
        if (skills.Count == 0) throw new InvalidOperationException(MissingAiInputsMessage);

        // 3. Load Resume
        var masterResume = await GetMasterResumeAsync(userId);
        if (masterResume == null) throw new InvalidOperationException(MissingAiInputsMessage);

        // 4. Extract Text
        var resumeText = await ExtractResumeTextAsync(masterResume);
        var skillsList = string.Join(", ", skills);

        return (application, application.Description, skillsList, resumeText);
    }

    private async Task<Document?> GetMasterResumeAsync(string userId)
    {
        var userDocuments = await _documentRepository.GetAllByUserIdAsync(userId);
        return userDocuments.FirstOrDefault(d => d.IsMaster && d.Type == DocumentType.Resume);
    }

    private async Task<string> ExtractResumeTextAsync(Document resume)
    {
        var filePath = Path.Combine(_uploadsPath, resume.FileName);

        // Ensure directory exists if we were checking for it, but for reading we just check file
        if (!File.Exists(filePath))
        {
            _logger.LogWarning("Resume file not found at {Path}", filePath);
            return $"Resume: {resume.OriginalFileName}\n\nNote: File not found on server.";
        }

        var resumeText = await _textExtractor.ExtractTextAsync(filePath);

        if (string.IsNullOrWhiteSpace(resumeText))
        {
            _logger.LogWarning("Text extraction failed for resume {ResumeId}", resume.Id);
            return $"Resume: {resume.OriginalFileName}\n\nNote: Full text extraction failed. Using metadata only.";
        }

        return resumeText;
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
        var dto = new JobApplicationDto
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

        // Try to hydrate transient lists from the persisted markdown feedback
        ParseAiFeedbackToDto(app.AiFeedback, dto);

        return dto;
    }

    /// <summary>
    /// Reconstructs the structured lists from the persisted markdown feedback.
    /// This ensures the UI remains populated even after page refresh.
    /// </summary>
    private static void ParseAiFeedbackToDto(string? aiFeedback, JobApplicationDto dto)
    {
        if (string.IsNullOrWhiteSpace(aiFeedback)) return;

        var lines = aiFeedback.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                              .Select(l => l.Trim());

        string currentSection = "";

        foreach (var line in lines)
        {
            if (line.StartsWith("## Good Points", StringComparison.OrdinalIgnoreCase))
            {
                currentSection = "GoodPoints";
                continue;
            }
            if (line.StartsWith("## Gaps", StringComparison.OrdinalIgnoreCase))
            {
                currentSection = "Gaps";
                continue;
            }
            if (line.StartsWith("## Strategic Advice", StringComparison.OrdinalIgnoreCase))
            {
                currentSection = "Advice";
                continue;
            }

            if (line.StartsWith("- ") && line.Length > 2)
            {
                var content = line[2..].Trim();
                switch (currentSection)
                {
                    case "GoodPoints": dto.AiGoodPoints.Add(content); break;
                    case "Gaps": dto.AiGaps.Add(content); break;
                    case "Advice": dto.AiAdvice.Add(content); break;
                }
            }
        }
    }
}
