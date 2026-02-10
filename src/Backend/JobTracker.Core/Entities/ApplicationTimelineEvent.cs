namespace JobTracker.Core.Entities;

public class ApplicationTimelineEvent
{
    public Guid Id { get; set; }

    public Guid JobApplicationId { get; set; }
    public JobApplication? JobApplication { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    // Type: "Interview", "Email", "Note", "StatusChange", "TechnicalTask"
    public string EventType { get; set; } = "Note";

    public string Title { get; set; } = string.Empty; // Pl: "Tech Interview with Peter"
    public string? Description { get; set; }

    // If interview, then we store the date here
    public DateTime? DueDate { get; set; }

    public Guid? RelatedDocumentId { get; set; }
}