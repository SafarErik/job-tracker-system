
namespace JobTracker.Core.Entities;


public class Company
{
    // Primary Key
    // By EF Core convention, the primary key will be the property with the name Id
    public int Id { get; set;} 
    
    // This property is required
    // The 'required' keyword means you can't leave this field empty
    public required string Name {get; set;}

    // The ? means nullable, so Website can be null
    public string? Website {get; set;}
    
    // User Relationship
    public required string UserId { get; set; }
    public ApplicationUser? User { get; set; }

    // Company's physical address
    public string? Address {get; set;}


    // Company Domain
    public string? Industry { get; set; }
    
    // Tech Stack (semicolon separated)
    public string? TechStack { get; set; }

    // Company Priority
    public string Priority { get; set; } = "Tier3";


    // Navigation property
    // Defines a one-to-many relationship: one company can have multiple job applications
    public ICollection<JobApplication> JobApplications {get; set;} = new List<JobApplication> ();

    // Companies can have multiple contacts
    public ICollection<CompanyContact> Contacts { get; set; } = new List<CompanyContact>();
}