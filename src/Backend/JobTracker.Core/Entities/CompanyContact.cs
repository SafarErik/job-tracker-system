using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobTracker.Core.Entities;

public class CompanyContact
{
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the contact person.
    /// </summary>
    [StringLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Contact email address.
    /// </summary>
    [EmailAddress]
    [StringLength(255)]
    public string? Email { get; set; }

    [Url]
    [StringLength(255)]
    public string? LinkedIn { get; set; }

    [StringLength(100)]
    public string? Role { get; set; }

    // Relationship with Company
    public Guid CompanyId { get; set; }
    public Company? Company { get; set; }

    // Relationship with JobApplications (as primary contact)
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}
