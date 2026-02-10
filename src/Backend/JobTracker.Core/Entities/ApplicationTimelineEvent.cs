using System.ComponentModel.DataAnnotations.Schema;
using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;

public class ApplicationTimelineEvent
{
    /// <summary>
    /// Unique identifier for the timeline event.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the associated job application.
    /// </summary>
    public Guid JobApplicationId { get; set; }

    /// <summary>
    /// Navigation property to the job application.
    /// </summary>
    public JobApplication? JobApplication { get; set; }

    /// <summary>
    /// Timestamp when the event occurred.
    /// </summary>
    public DateTime OccurredAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// The type of event (e.g., "Interview", "Email", "Note").
    /// </summary>
    public TimelineEventType EventType { get; set; } = TimelineEventType.Note;

    /// <summary>
    /// Short title or summary of the event (e.g., "Tech Interview with Peter").
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description or notes for the event.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Deadline or scheduled time for the event (e.g., interview time).
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Foreign key to an associated document (e.g. an interview task).
    /// </summary>
    public Guid? RelatedDocumentId { get; set; }

    /// <summary>
    /// Navigation property to the related document.
    /// </summary>
    [ForeignKey("RelatedDocumentId")]
    public Document? RelatedDocument { get; set; }
}