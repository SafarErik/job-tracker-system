using JobTracker.Core.Enums;
using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Core.Entities;
using JobTracker.Core.Models;
using System.Text.Json;

namespace JobTracker.Application.Mappers;

/// <summary>
/// Provides static mapping methods for converting between JobApplication entities and DTOs.
/// </summary>
public static class JobApplicationMapper
{
    private static readonly JsonSerializerOptions FitReviewJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    /// <summary>
    /// Maps a JobApplication entity to a detailed JobApplicationDto.
    /// Parses AI feedback strings into structured lists.
    /// </summary>
    public static JobApplicationDto MapToDto(JobApplication app)
    {
        var dto = new JobApplicationDto
        {
            Id = app.Id,
            Position = app.Position,
            JobUrl = app.JobUrl,
            Description = app.Description,
            GeneratedCoverLetter = app.GeneratedCoverLetter,
            AiFeedback = app.AiFeedback,
            FitReview = DeserializeFitReview(app.FitReviewJson),
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
            BaseSalary = app.BaseSalary,
            Bonus = app.Bonus,
            EquityValue = app.EquityValue,
            Currency = app.Currency ?? Currency.USD,
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
            ConcurrencyToken = app.ConcurrencyToken
        };

        ParseAiFeedbackToDto(app.AiFeedback, dto);

        return dto;
    }

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

            // Reset section if a new header is found but not recognized
            if (line.StartsWith("## "))
            {
                currentSection = "";
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

    /// <summary>
    /// Maps a CreateJobApplicationDto to a new JobApplication entity.
    /// Default values (like AppliedAt, empty collections) are set here.
    /// </summary>
    public static JobApplication MapToEntity(CreateJobApplicationDto dto, string userId)
    {
        return new JobApplication
        {
            UserId = userId,
            Position = dto.Position,
            CompanyId = dto.CompanyId,
            JobUrl = dto.JobUrl,
            Description = dto.Description,
            Status = dto.Status,
            JobType = dto.JobType,
            WorkplaceType = dto.WorkplaceType,
            Priority = dto.Priority,
            MatchScore = dto.MatchScore,
            SalaryOffer = dto.SalaryOffer,
            BaseSalary = dto.BaseSalary,
            Bonus = dto.Bonus,
            EquityValue = dto.EquityValue,
            Currency = dto.Currency,
            DocumentId = dto.DocumentId,
            PrimaryContactId = dto.PrimaryContactId,
            AppliedAt = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Updates an existing JobApplication entity with values from an UpdateJobApplicationDto.
    /// Only non-null/non-empty values from the DTO are applied (partial update).
    /// </summary>
    public static void ApplyUpdate(UpdateJobApplicationDto dto, JobApplication entity)
    {
        if (dto.Position != null) entity.Position = dto.Position;
        if (dto.CompanyId.HasValue) entity.CompanyId = dto.CompanyId.Value;
        if (dto.JobUrl != null) entity.JobUrl = dto.JobUrl;
        if (dto.Description != null && dto.Description != entity.Description)
        {
            entity.Description = dto.Description;
            entity.FitReviewJson = null;
        }
        if (dto.Status.HasValue) entity.Status = dto.Status.Value;
        if (dto.JobType.HasValue) entity.JobType = dto.JobType.Value;
        if (dto.WorkplaceType.HasValue) entity.WorkplaceType = dto.WorkplaceType.Value;
        if (dto.Priority.HasValue) entity.Priority = dto.Priority.Value;
        if (dto.MatchScore.HasValue) entity.MatchScore = dto.MatchScore.Value;
        if (dto.SalaryOffer.HasValue) entity.SalaryOffer = dto.SalaryOffer.Value;
        if (dto.BaseSalary.HasValue) entity.BaseSalary = dto.BaseSalary.Value;
        if (dto.Bonus.HasValue) entity.Bonus = dto.Bonus.Value;
        if (dto.EquityValue.HasValue) entity.EquityValue = dto.EquityValue.Value;
        if (dto.Currency.HasValue) entity.Currency = dto.Currency.Value;
        if (dto.DocumentIdProvided) entity.DocumentId = dto.DocumentId;
        if (dto.PrimaryContactId.HasValue) entity.PrimaryContactId = dto.PrimaryContactId;
    }

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
}
