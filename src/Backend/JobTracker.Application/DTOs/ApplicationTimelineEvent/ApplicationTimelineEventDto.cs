using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;

namespace JobTracker.Application.DTOs.JobApplications;

public class ApplicationTimelineEventDto
{
    public Guid Id { get; set; }

    public DateTime OccurredAt { get; set; }

    public TimelineEventType EventType { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public Guid? RelatedDocumentId { get; set; }
}

public class CreateApplicationTimelineEventDto
{
    [Required]
    public Guid JobApplicationId { get; set; }

    [Required]
    public DateTime OccurredAt { get; set; }

    [Required]
    public TimelineEventType EventType { get; set; } = TimelineEventType.Note;

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    public Guid? RelatedDocumentId { get; set; }
}
