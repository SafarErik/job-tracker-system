namespace JobTracker.API.DTOs;

public class CompanyDto
{
    public int Id {get; set;}
    public string Name { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? HRContactName { get; set; }
    public string? HRContactEmail { get; set; }
    public string? HRContactLinkedIn { get; set; }
    
    // Total number of applications submitted to this company
    public int TotalApplications { get; set; }

}