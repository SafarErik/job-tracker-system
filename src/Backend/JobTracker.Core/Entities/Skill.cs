namespace JobTracker.Core.Entities;

public class Skill
{
    public int Id { get; set;}

    public required string Name {get; set;}

    public ICollection<JobApplication> JobApplications {get; set;} = new List<JobApplication>();

    


}