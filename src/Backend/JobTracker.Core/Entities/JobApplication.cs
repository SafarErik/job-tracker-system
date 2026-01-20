using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;


public class JobApplication
{
    // Primary key
    public int Id {get; set;}

    public required string Position  {get; set;} // For example: Junior Developer

    public string? JobUrl {get; set;}

    public string? Description {get; set;}

    // The application date
    public DateTime AppliedAt {get; set;} = DateTime.UtcNow;

    public JobApplicationStatus Status {get; set;} = JobApplicationStatus.Applied;

    public decimal? SalaryOffer {get; set;} // Nullable

    // Foreign key - references Company
    public int CompanyId {get; set;}

    // Navigation property
    // When requesting data from the database, EF Core can automatically load
    // the related company
    public Company? Company {get; set;}

    // Foreign key - references Document (CV/Resume)
    public Guid? DocumentId { get; set; }

    // Navigation property
    public Document? Document { get; set; }

    // Many-to-many relationship with Skills
    public ICollection<Skill> Skills {get; set;} = new List<Skill>();

}