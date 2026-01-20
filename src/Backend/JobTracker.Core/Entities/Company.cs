
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

    // Company's physical address
    public string? Address {get; set;}

    // HR Contact Information
    // Full name of the HR contact person
    public string? HRContactName {get; set;}
    
    // Email address of the HR contact person
    public string? HRContactEmail {get; set;}
    
    // LinkedIn profile URL of the HR contact person
    public string? HRContactLinkedIn {get; set;}

    // Legacy field - kept for backward compatibility
    // Consider using HRContactName instead
    [Obsolete("Use HRContactName instead")]
    public string? ContactPerson {get; set;}

    // Navigation property
    // Defines a one-to-many relationship: one company can have multiple job applications
    public ICollection<JobApplication> JobApplications {get; set;} = new List<JobApplication> ();

}