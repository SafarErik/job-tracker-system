namespace JobTracker.Application.DTOs.AI;

public class ResumeEnhancementDto
{
    public Guid Id { get; set; }
    public string OriginalBullet { get; set; } = string.Empty;
    public string RebrandedBullet { get; set; } = string.Empty;
    public string Reasoning { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // 'experience' | 'skill' | 'achievement'
}
