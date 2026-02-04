namespace JobTracker.Application.DTOs.AI;

public class CoverLetterDraftDto
{
    public string Content { get; set; } = string.Empty;
    public DateTime? GeneratedAt { get; set; }
    public Guid? BasedOnResumeId { get; set; }
    public bool IsEdited { get; set; }
}
