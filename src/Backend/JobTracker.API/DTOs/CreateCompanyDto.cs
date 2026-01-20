using System.ComponentModel.DataAnnotations; // Validációhoz kell!

namespace JobTracker.API.DTOs;

public class CreateCompanyDto
{
    [Required(ErrorMessage = "Company Name must be filled out!")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? HRContactName { get; set; }
    
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? HRContactEmail { get; set; }
    
    [Url(ErrorMessage = "Invalid LinkedIn URL format")]
    public string? HRContactLinkedIn { get; set; }
}