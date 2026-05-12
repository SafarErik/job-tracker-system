using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Models;

namespace JobTracker.Application.DTOs.AI;

public class RefineJobBriefRequestDto
{
    [Required]
    public string Description { get; set; } = string.Empty;
}

public class RefinedJobBriefDto
{
    public string Description { get; set; } = string.Empty;
    public RoleBrief RoleBrief { get; set; } = new();
    public List<string> Changes { get; set; } = new();
}
