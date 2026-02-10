
using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;


public class Company
{
    // Primary Key
    // By EF Core convention, the primary key will be the property with the name Id
    public Guid Id { get; set; }

    // This property is required
    // The 'required' keyword means you can't leave this field empty
    public required string Name { get; set; }

    // The ? means nullable, so Website can be null
    public string? Website { get; set; }

    // User Relationship
    public required string UserId { get; set; }
    public ApplicationUser? User { get; set; }

    // Company's physical address
    public string? Address { get; set; }


    // Company Domain
    public string? Industry { get; set; }

    // Company Priority
    public CompanyPriority Priority { get; set; } = CompanyPriority.MidTier;

    public string? LogoUrl { get; set; }
    public string? HqLocation { get; set; }
    public string? Description { get; set; }
    public int CompatibilityScore { get; set; }

    public ICollection<Skill> TechStack { get; set; } = new List<Skill>();

    // Navigation property
    // Defines a one-to-many relationship: one company can have multiple job applications
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();

    // Companies can have multiple contacts
    public ICollection<CompanyContact> Contacts { get; set; } = new List<CompanyContact>();


}