using JobTracker.Application.DTOs.Companies;
using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Core.Entities;

namespace JobTracker.Application.Mappers;

public static class JobApplicationMapper
{
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
