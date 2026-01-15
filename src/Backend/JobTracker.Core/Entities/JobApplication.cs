using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;


public class JobApplication
{
    // Primary key
    public int Id {get; set;}

    public  required string Position  {get; set;} // For example: Junior Developer

    // The application date
    public DateTime AppliedDate {get; set;} = DateTime.UtcNow;

    public ApplicationStatus Status {get; set;} = ApplicationStatus.Applied;

    public decimal? SalaryOffer {get; set;} // Nullable

    // Connections to the company class

    // Foreign key
    public int CompanyId {get; set;}

    // Navigation Property
    // When we request the date from the database, The EF core can automatically load up
    // the appropriate company
    public Company? Company {get; set;}

    public ICollection<Skill> Skills {get; set;} = new List<Skill>();

}