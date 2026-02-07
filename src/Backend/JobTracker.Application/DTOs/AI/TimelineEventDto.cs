namespace JobTracker.Application.DTOs.AI;

public class TimelineEventDto
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty; // 'created' | 'applied' | 'status_change' | 'ai_analysis' | 'document_attached' | 'interview_scheduled' | 'note_added'
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime Timestamp { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}
