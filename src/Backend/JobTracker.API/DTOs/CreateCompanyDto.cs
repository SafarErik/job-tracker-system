using System.ComponentModel.DataAnnotations; // Validációhoz kell!

namespace JobTracker.API.DTOs;

public class CreateCompanyDto
{
    [Required(ErrorMessage = "Company Name must be filled out!")]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    public string? WebsiteUrl { get; set; }
    public string? ContactPerson { get; set; }
}