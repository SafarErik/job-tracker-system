namespace JobTracker.API.DTOs;

/// <summary>
/// Detailed company information including application history
/// </summary>
public class CompanyDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? HRContactName { get; set; }
    public string? HRContactEmail { get; set; }
    public string? HRContactLinkedIn { get; set; }
    
    // Application statistics
    public int TotalApplications { get; set; }
    
    // Application history for this company
    public List<JobApplicationHistoryDto> ApplicationHistory { get; set; } = new();
}

/// <summary>
/// Summary of a job application for company history view
/// </summary>
public class JobApplicationHistoryDto
{
    public int Id { get; set; }
    public string Position { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? SalaryOffer { get; set; }
}
