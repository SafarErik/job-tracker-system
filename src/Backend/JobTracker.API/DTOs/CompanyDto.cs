namespace JobTracker.API.DTOs;

public class CompanyDto
{
    public int Id {get; set;}
    public string Name { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? ContactPerson { get; set; }

}