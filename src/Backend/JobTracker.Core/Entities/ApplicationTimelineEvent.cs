using System.ComponentModel.DataAnnotations.Schema;
using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;

public class ApplicationTimelineEvent
{
    public Guid Id { get; set; }

    public Guid JobApplicationId { get; set; }
    public JobApplication? JobApplication { get; set; }

    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    // Type: "Interview", "Email", "Note", "StatusChange", "TechnicalTask"
    public TimelineEventType EventType { get; set; } = TimelineEventType.Note;

    public string Title { get; set; } = string.Empty; // Pl: "Tech Interview with Peter"
    public string? Description { get; set; }

    // If interview, then we store the date here
    public DateTime? DueDate { get; set; }

    public Guid? RelatedDocumentId { get; set; }

    [ForeignKey("RelatedDocumentId")]
    public Document? RelatedDocument { get; set; }
}