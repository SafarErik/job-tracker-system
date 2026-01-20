using JobTracker.Core.Enums;

namespace JobTracker.API.DTOs;

/// <summary>
/// DTO for updating job applications.
/// Allows partial updates - only non-null fields will be updated.
/// </summary>
public class UpdateJobApplicationDto
{
    /// <summary>
    /// Job position/title
    /// </summary>
    public string? Position { get; set; }

    /// <summary>
    /// Company ID
    /// </summary>
    public int? CompanyId { get; set; }

    /// <summary>
    /// URL to the job posting
    /// </summary>
    public string? JobUrl { get; set; }

    /// <summary>
    /// Application notes/description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Reference to the CV/Resume document
    /// </summary>
    public Guid? DocumentId { get; set; }

    /// <summary>
    /// Application status
    /// </summary>
    public JobApplicationStatus? Status { get; set; }
}
