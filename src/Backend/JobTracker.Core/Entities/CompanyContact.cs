using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobTracker.Core.Entities;

public class CompanyContact
{
    public Guid Id { get; set; }

    [Required]
    public required string Name { get; set; }

    public string? Email { get; set; }

    public string? LinkedIn { get; set; }

    public string? Role { get; set; }

    // Relationship with Company
    public Guid CompanyId { get; set; }
    public Company? Company { get; set; }

    // Relationship with JobApplications (as primary contact)
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}
