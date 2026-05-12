using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.DTOs.AI;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Application.Interfaces;
using JobTracker.Core.Enums;
using JobTracker.Core.Models;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace JobTracker.Application.Services;

/// <summary>
/// Service implementation for job application business logic.
/// Orchestrates AI analysis and data persistence operations.
/// </summary>
public class JobApplicationService : IJobApplicationService
{
    private readonly IJobApplicationRepository _jobRepository;
    private readonly IDocumentRepository _documentRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAIService _aiService;
    private readonly IDocumentTextExtractor _textExtractor;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<JobApplicationService> _logger;

    private const string MissingAiInputsMessage = "Please upload a Master Resume and add skills to your profile first.";
    private static readonly JsonSerializerOptions FitReviewJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    public JobApplicationService(
        IJobApplicationRepository jobRepository,
        IDocumentRepository documentRepository,
        IUserRepository userRepository,
        IAIService aiService,
        IDocumentTextExtractor textExtractor,
        IFileStorageService fileStorageService,
        ILogger<JobApplicationService> logger)
    {
        _jobRepository = jobRepository;
        _userRepository = userRepository;
        _documentRepository = documentRepository;
        _aiService = aiService;
        _textExtractor = textExtractor;
        _fileStorageService = fileStorageService;
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

    public async Task<JobApplicationDto> CreateJobAsync(CreateJobApplicationDto dto, string userId)
    {
        var application = new JobApplication
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Position = dto.Position,
            CompanyId = dto.CompanyId,
            JobUrl = dto.JobUrl,
            Description = dto.Description,
            Status = dto.Status,
            JobType = dto.JobType,
            WorkplaceType = dto.WorkplaceType,
            Priority = dto.Priority,
            SalaryOffer = dto.SalaryOffer,
            BaseSalary = dto.BaseSalary,
            Bonus = dto.Bonus,
            EquityValue = dto.EquityValue,
            Currency = dto.Currency,
            MatchScore = dto.MatchScore,
            DocumentId = dto.DocumentId,
            PrimaryContactId = dto.PrimaryContactId,
            AppliedAt = DateTime.UtcNow
        };

        await _jobRepository.AddAsync(application);

        // Fetch again to include navigation properties for the DTO
        var created = await _jobRepository.GetByIdAsync(application.Id);
        return MapToDto(created ?? application);
    }

    public async Task<bool> UpdateJobAsync(Guid id, UpdateJobApplicationDto dto, string userId)
    {
        var existing = await _jobRepository.GetByIdAsync(id);
        if (existing == null || existing.UserId != userId)
            return false;

        if (dto.Position != null) existing.Position = dto.Position;
        if (dto.CompanyId.HasValue) existing.CompanyId = dto.CompanyId.Value;
        if (dto.JobUrl != null) existing.JobUrl = dto.JobUrl;
        if (dto.Description != null && dto.Description != existing.Description)
        {
            existing.Description = dto.Description;
            existing.FitReviewJson = null;
        }
        if (dto.Status.HasValue) existing.Status = dto.Status.Value;
        if (dto.JobType.HasValue) existing.JobType = dto.JobType.Value;
        if (dto.WorkplaceType.HasValue) existing.WorkplaceType = dto.WorkplaceType.Value;
        if (dto.Priority.HasValue) existing.Priority = dto.Priority.Value;
        if (dto.SalaryOfferProvided) existing.SalaryOffer = dto.SalaryOffer;
        if (dto.BaseSalaryProvided) existing.BaseSalary = dto.BaseSalary;
        if (dto.BonusProvided) existing.Bonus = dto.Bonus;
        if (dto.EquityValueProvided) existing.EquityValue = dto.EquityValue;
        if (dto.CurrencyProvided) existing.Currency = dto.Currency;

        if (dto.MatchScore.HasValue) existing.MatchScore = dto.MatchScore.Value;

        // Use DocumentIdProvided to determine if we should update the DocumentId (allows clearing it)
        if (dto.DocumentIdProvided) existing.DocumentId = dto.DocumentId;

        if (dto.PrimaryContactId.HasValue) existing.PrimaryContactId = dto.PrimaryContactId.Value;

        // EF Core will compare this OriginalValue against the database value during SaveChanges
        // If they differ, a DbUpdateConcurrencyException will be thrown.
        _jobRepository.SetOriginalConcurrencyToken(existing, dto.ConcurrencyToken);

        // Assign a NEW token for the next version.
        existing.ConcurrencyToken = Guid.NewGuid();

        await _jobRepository.UpdateAsync(existing);
        return true;
    }

    public async Task<bool> DeleteJobAsync(Guid id, string userId)
    {
        var existing = await _jobRepository.GetByIdAsync(id);
        if (existing == null || existing.UserId != userId)
            return false;

        await _jobRepository.DeleteAsync(id);
        return true;
    }

    public async Task<RefinedJobBriefDto> RefineJobBriefAsync(Guid jobId, string userId, string description)
    {
        var application = await _jobRepository.GetByIdAsync(jobId);
        if (application == null || application.UserId != userId)
        {
            throw new KeyNotFoundException($"Job application {jobId} not found");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new InvalidOperationException("A job description is required before it can be refined.");
        }

        var companyName = application.Company?.Name ?? "the hiring company";
        var result = await _aiService.RefineJobBriefAsync(description, companyName, application.Position);

        if (!result.Success)
        {
            throw new InvalidOperationException(result.ErrorMessage ?? "Job brief refinement failed");
        }

        return new RefinedJobBriefDto
        {
            Description = result.Description,
            RoleBrief = result.RoleBrief,
            Changes = result.Changes
        };
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
        ApplyAnalysisResult(application, analysisResult, jobDescription);

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

            ApplyAnalysisResult(application, analysisResult, jobDescription);
        await _jobRepository.UpdateAsync(application);

        return new AiGeneratedAssetsDto
        {
            MatchScore = analysisResult.MatchScore,
            GoodPoints = analysisResult.GoodPoints,
            Gaps = analysisResult.Gaps,
            Advice = analysisResult.Advice,
            AiFeedback = application.AiFeedback ?? string.Empty,
            FitReview = DeserializeFitReview(application.FitReviewJson),
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
        existing.ConcurrencyToken = Guid.NewGuid();
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

        // 2. Load User Skills via Repository abstraction (No DbContext)
        var user = await _userRepository.GetUserWithSkillsAsync(userId);
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
        if (string.IsNullOrEmpty(resume.FileName))
        {
            _logger.LogWarning("Resume document {ResumeId} has no filename", resume.Id);
            return $"Resume: {resume.OriginalFileName}\n\nNote: Invalid file record.";
        }

        if (!_fileStorageService.FileExists(resume.FileName))
        {
            _logger.LogWarning("Resume file not found via storage service: {FileName}", resume.FileName);
            return $"Resume: {resume.OriginalFileName}\n\nNote: File not found on server.";
        }

        var filePath = _fileStorageService.GetFilePath(resume.FileName);
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

    private static void ApplyAnalysisResult(JobApplication application, AiAnalysisResult analysisResult, string jobDescription)
    {
        if (analysisResult.Success)
        {
            application.MatchScore = analysisResult.MatchScore;
            application.AiFeedback = BuildAiFeedback(analysisResult);
            application.FitReviewJson = SerializeFitReview(
                NormalizeFitReview(analysisResult, jobDescription)
            );
            application.ConcurrencyToken = Guid.NewGuid();

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

    private static FitReview NormalizeFitReview(AiAnalysisResult analysisResult, string jobDescription)
    {
        var review = analysisResult.FitReview ?? CreateFallbackFitReview(analysisResult, jobDescription);

        review.GeneratedAt = DateTimeOffset.UtcNow.ToString("O");
        review.SourceHash = ComputeSourceHash(jobDescription);
        review.MatchScore = Math.Clamp(review.MatchScore == 0 ? analysisResult.MatchScore : review.MatchScore, 0, 100);

        review.ExecutiveSummary = DefaultIfEmpty(review.ExecutiveSummary, analysisResult.StrategicAdvice);
        review.FullReviewMarkdown = DefaultIfEmpty(review.FullReviewMarkdown, BuildAiFeedback(analysisResult));
        review.RoleBrief ??= new RoleBrief();
        review.KeySignals ??= new List<FitKeySignal>();
        review.Gaps ??= new List<FitGap>();
        review.NextActions ??= new List<string>();

        foreach (var gap in review.Gaps)
        {
            gap.Id = DefaultIfEmpty(gap.Id, CreateStableGapId(gap.Skill));
            gap.Priority = NormalizePriority(gap.Priority);
            gap.EstimatedScoreGain = Math.Clamp(gap.EstimatedScoreGain, 0, 25);
            gap.LearningPlan ??= new FitLearningPlan();
        }

        return review;
    }

    private static FitReview CreateFallbackFitReview(AiAnalysisResult analysisResult, string jobDescription)
    {
        var missingSkills = analysisResult.MissingSkills.Count > 0
            ? analysisResult.MissingSkills
            : analysisResult.Gaps;

        return new FitReview
        {
            MatchScore = analysisResult.MatchScore,
            ExecutiveSummary = DefaultIfEmpty(analysisResult.StrategicAdvice, analysisResult.GapAnalysis),
            RoleBrief = BuildFallbackRoleBrief(jobDescription, analysisResult),
            KeySignals = analysisResult.GoodPoints.Select(point => new FitKeySignal
            {
                Label = point,
                Evidence = point,
                Type = FitSignalTypes.Strength
            }).ToList(),
            Gaps = missingSkills.Take(5).Select((gap, index) => new FitGap
            {
                Id = CreateStableGapId(gap),
                Skill = gap,
                WhyItMatters = gap,
                CurrentEvidence = analysisResult.Advice.ElementAtOrDefault(index) ?? "No direct evidence found yet.",
                Priority = index == 0 ? FitGapPriorities.High : FitGapPriorities.Medium,
                EstimatedScoreGain = index == 0 ? 10 : 6,
                LearningPlan = new FitLearningPlan
                {
                    Topics = new List<string> { gap },
                    PracticeTasks = new List<string> { $"Build one small project or interview answer that demonstrates {gap}." },
                    SearchQueries = new List<string> { $"{gap} tutorial", $"{gap} interview practice" }
                }
            }).ToList(),
            NextActions = analysisResult.Advice.Count > 0
                ? analysisResult.Advice.Take(4).ToList()
                : new List<string> { "Refresh the resume angle around the strongest role requirements." },
            FullReviewMarkdown = BuildAiFeedback(analysisResult)
        };
    }

    private static RoleBrief BuildFallbackRoleBrief(string jobDescription, AiAnalysisResult analysisResult)
    {
        var lines = jobDescription
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim().TrimStart('-', '*', '•').Trim())
            .Where(line => line.Length > 0)
            .Take(10)
            .ToList();

        return new RoleBrief
        {
            Overview = lines.Take(3).ToList(),
            Responsibilities = lines.Skip(3).Take(4).ToList(),
            Requirements = analysisResult.MissingSkills.Take(6).ToList(),
            Keywords = analysisResult.MissingSkills
                .Concat(analysisResult.GoodPoints)
                .SelectMany(value => value.Split(new[] { ' ', ',', '.', ';', '/', '(', ')' }, StringSplitOptions.RemoveEmptyEntries))
                .Where(value => value.Length > 3)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(10)
                .ToList()
        };
    }

    private static string SerializeFitReview(FitReview review) =>
        JsonSerializer.Serialize(review, FitReviewJsonOptions);

    private static FitReview? DeserializeFitReview(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;

        try
        {
            return JsonSerializer.Deserialize<FitReview>(json, FitReviewJsonOptions);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string ComputeSourceHash(string value)
    {
        var normalized = string.Join('\n', value.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim())
            .Where(line => line.Length > 0));

        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static string CreateStableGapId(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value.Trim().ToLowerInvariant()));
        return Convert.ToHexString(hash)[..12].ToLowerInvariant();
    }

    private static string NormalizePriority(string? priority) =>
        priority?.ToLowerInvariant() switch
        {
            FitGapPriorities.High => FitGapPriorities.High,
            FitGapPriorities.Low => FitGapPriorities.Low,
            _ => FitGapPriorities.Medium
        };

    private static string DefaultIfEmpty(string? value, string fallback) =>
        string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();

    private static JobApplicationDto MapToDto(JobApplication app)
    {
        return Mappers.JobApplicationMapper.MapToDto(app);
    }
}
