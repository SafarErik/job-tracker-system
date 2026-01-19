using System.ComponentModel.DataAnnotations;
namespace JobTracker.API.DTOs;
public class CreateSkillDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
}