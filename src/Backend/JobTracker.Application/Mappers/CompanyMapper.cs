using JobTracker.Application.DTOs.Companies;
using JobTracker.Core.Entities;

namespace JobTracker.Application.Mappers;

/// <summary>
/// Provides static mapping methods for converting between Company entities and DTOs.
/// </summary>
public static class CompanyMapper
{
    /// <summary>
    /// Maps a Company entity to a summary CompanyDto.
    /// Includes a subset of recent applications.
    /// </summary>
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

    /// <summary>
    /// Maps a Company entity to a detailed CompanyDetailDto.
    /// Includes full contact list and application history.
    /// </summary>
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

    /// <summary>
    /// Maps a CreateCompanyDto to a new Company entity.
    /// </summary>
    public static Company MapToEntity(CreateCompanyDto dto, string userId)
    {
        return new Company
        {
            UserId = userId,
            Name = dto.Name,
            Website = dto.Website,
            Address = dto.Address,
            LogoUrl = dto.LogoUrl,
            HqLocation = dto.HqLocation,
            Description = dto.Description,
            Industry = dto.Industry,
            Priority = dto.Priority,
            TechStack = dto.TechStack?.Select(s => new Skill { Name = s }).ToList() ?? new List<Skill>(),
            Contacts = dto.Contacts?.Select(c => new CompanyContact
            {
                Name = c.Name,
                Email = c.Email,
                LinkedIn = c.LinkedIn,
                Role = c.Role
            }).ToList() ?? new List<CompanyContact>()
        };
    }

    /// <summary>
    /// Updates an existing Company entity with values from an UpdateCompanyDto.
    /// Applies partial updates and syncs the Contacts collection.
    /// </summary>
    public static void ApplyUpdate(UpdateCompanyDto dto, Company entity)
    {
        if (!string.IsNullOrEmpty(dto.Name)) entity.Name = dto.Name;
        if (dto.Website != null) entity.Website = dto.Website;
        if (dto.Address != null) entity.Address = dto.Address;
        if (dto.LogoUrl != null) entity.LogoUrl = dto.LogoUrl;
        if (dto.HqLocation != null) entity.HqLocation = dto.HqLocation;
        if (dto.Description != null) entity.Description = dto.Description;
        if (dto.Priority.HasValue) entity.Priority = dto.Priority.Value;
        if (dto.Industry != null) entity.Industry = dto.Industry;

        // SKIP TechStack update for now as per controller logic (avoids complexity)

        // Update Contacts
        if (dto.Contacts != null)
        {
            var existingContacts = entity.Contacts.ToList();

            // Remove
            foreach (var existing in existingContacts)
            {
                if (!dto.Contacts.Any(c => c.Id == existing.Id))
                {
                    entity.Contacts.Remove(existing);
                }
            }

            // Add or Update
            foreach (var contactDto in dto.Contacts)
            {
                if (contactDto.Id == Guid.Empty)
                {
                    entity.Contacts.Add(new CompanyContact
                    {
                        Name = contactDto.Name,
                        Email = contactDto.Email,
                        LinkedIn = contactDto.LinkedIn,
                        Role = contactDto.Role,
                        CompanyId = entity.Id
                    });
                }
                else
                {
                    var contact = entity.Contacts.FirstOrDefault(c => c.Id == contactDto.Id);
                    if (contact != null)
                    {
                        contact.Name = contactDto.Name;
                        contact.Email = contactDto.Email;
                        contact.LinkedIn = contactDto.LinkedIn;
                        contact.Role = contactDto.Role;
                    }
                }
            }
        }
    }
}
