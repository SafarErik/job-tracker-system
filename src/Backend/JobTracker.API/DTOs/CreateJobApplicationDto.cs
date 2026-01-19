using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;

namespace JobTracker.API.DTOs;

public class CreateJobApplicationDto
{
    [Required(ErrorMessage = "The Position field cannot be empty!")]
    public string Position { get; set; } = string.Empty;

    [Required(ErrorMessage = "Selecting a company is mandatory!")]
    [Range(1, int.MaxValue, ErrorMessage = "Please select a valid company.")]
    public int CompanyId { get; set; }

    public string? JobUrl { get; set; }
    public string? Description { get; set; }
    
    public JobApplicationStatus Status { get; set; } = JobApplicationStatus.Applied;

}