using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;
using JobTracker.Application.DTOs.Companies;

namespace JobTracker.Application.DTOs.JobApplications;

public class JobApplicationDto
{
    public Guid Id { get; set; }
    public string Position { get; set; } = string.Empty;
    public string? JobUrl { get; set; }
    public string? Description { get; set; }

    public string? GeneratedCoverLetter { get; set; }
    public string? AiFeedback { get; set; }
    public int MatchScore { get; set; }

    public DateTime AppliedAt { get; set; }
    public JobApplicationStatus Status { get; set; }
    public JobType JobType { get; set; }
    public WorkplaceType WorkplaceType { get; set; }
    public JobPriority Priority { get; set; }
    public decimal? SalaryOffer { get; set; }

    public Guid CompanyId { get; set; }
    public string? CompanyName { get; set; }
    public Guid? DocumentId { get; set; }
    public string? DocumentName { get; set; }

    public List<string> Skills { get; set; } = new();

    public CompanyContactDto? PrimaryContact { get; set; }

    public uint RowVersion { get; set; }
}

public class CreateJobApplicationDto
{
    [Required]
    public string Position { get; set; } = string.Empty;

    [Required]
    public Guid CompanyId { get; set; }

    public string? JobUrl { get; set; }
    public string? Description { get; set; }

    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Applied;
    public JobType JobType { get; set; } = JobType.FullTime;
    public WorkplaceType WorkplaceType { get; set; } = WorkplaceType.OnSite;
    public JobPriority Priority { get; set; } = JobPriority.Medium;
    public decimal? SalaryOffer { get; set; }
    public int MatchScore { get; set; }
    public Guid? DocumentId { get; set; }
    public Guid? PrimaryContactId { get; set; }
}

public class UpdateJobApplicationDto
{

    [Required]
    public uint RowVersion { get; set; }

    public string? Position { get; set; }
    public Guid? CompanyId { get; set; }
    public string? JobUrl { get; set; }
    public string? Description { get; set; }
    public JobApplicationStatus? Status { get; set; }
    public JobType? JobType { get; set; }
    public WorkplaceType? WorkplaceType { get; set; }
    public JobPriority? Priority { get; set; }
    public decimal? SalaryOffer { get; set; }
    public int? MatchScore { get; set; }
    public Guid? DocumentId { get; set; }
    public bool DocumentIdProvided { get; set; }
    public Guid? PrimaryContactId { get; set; }
}