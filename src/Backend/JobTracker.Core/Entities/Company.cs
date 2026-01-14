
namespace JobTracker.Core.Entities;


public class Company
{
    // Primary Key
    // Az EF core convention, the primary key will be the attribute with
    // the name Id
    public int Id { get; set;} 
    
    // This attribute will be a must
    // the required word means you can't leave this field empty
    public required string Name {get; set;}

    // The ? means nullable, so Website can be null
    public string? Website {get; set;}

    public ICollection<JobApplication> jobApplications {get; set;} = new List<JobApplication> ();

}