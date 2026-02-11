using JobTracker.Application.DTOs.Companies;
using JobTracker.Core.Entities;

namespace JobTracker.Application.Mappers;

public static class CompanyMapper
{
    public static CompanyDto MapToDto(Company company)
    {
        if (company == null) throw new ArgumentNullException(nameof(company));

        return new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            LogoUrl = company.LogoUrl,
            HqLocation = company.HqLocation,
            Description = company.Description,
            CompatibilityScore = company.CompatibilityScore,
            Industry = company.Industry,
            TechStack = company.TechStack?.Select(s => s.Name).ToList() ?? new List<string>(),
            Priority = company.Priority,
            TotalApplications = company.JobApplications?.Count ?? 0,
            RecentApplications = company.JobApplications?
                .OrderByDescending(j => j.AppliedAt)
                .Take(5)
                .Select(j => new JobApplicationHistoryDto
                {
                    Id = j.Id,
                    Position = j.Position,
                    AppliedAt = j.AppliedAt,
                    Status = j.Status.ToString(),
                    SalaryOffer = j.SalaryOffer
                })
                .ToList() ?? new List<JobApplicationHistoryDto>()
        };
    }

    public static CompanyDetailDto MapToDetailDto(Company company)
    {
        return new CompanyDetailDto
        {
            Id = company.Id,
            Name = company.Name,
            Website = company.Website,
            Address = company.Address,
            LogoUrl = company.LogoUrl,
            HqLocation = company.HqLocation,
            Description = company.Description,
            CompatibilityScore = company.CompatibilityScore,
            Industry = company.Industry,
            TechStack = company.TechStack?.Select(s => s.Name).ToList() ?? new List<string>(),
            Priority = company.Priority,
            TotalApplications = company.JobApplications?.Count ?? 0,
            Contacts = company.Contacts?.Select(c => new CompanyContactDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                LinkedIn = c.LinkedIn,
                Role = c.Role
            }).ToList() ?? new List<CompanyContactDto>(),
            ApplicationHistory = company.JobApplications?
                .OrderByDescending(j => j.AppliedAt)
                .Select(j => new JobApplicationHistoryDto
                {
                    Id = j.Id,
                    Position = j.Position,
                    AppliedAt = j.AppliedAt,
                    Status = j.Status.ToString(),
                    SalaryOffer = j.SalaryOffer
                })
                .ToList() ?? new List<JobApplicationHistoryDto>()
        };
    }
}
