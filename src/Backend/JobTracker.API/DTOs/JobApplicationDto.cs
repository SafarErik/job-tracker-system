using JobTracker.Core.Enums;

namespace JobTracker.API.DTOs;

public class JobApplicationDto
{
    public int Id {get; set;}
    public string Position { get; set; } = string.Empty;
    public string? JobUrl { get; set; }
    public string? Description { get; set; }
    public DateTime AppliedAt { get; set; }
    public JobApplicationStatus Status { get; set; }

    // Connections
    public int CompanyId { get; set; }
    public string? CompanyName { get; set; } // This will be very handy for the frontend

    public Guid? DocumentId { get; set; }
    public string? DocumentName { get; set; } // Original filename of the CV

}