namespace JobTracker.Application.DTOs.AI;

public class InterviewQuestionDto
{
    public Guid Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // 'behavioral' | 'technical' | 'situational' | 'company'
    public string Difficulty { get; set; } = string.Empty; // 'easy' | 'medium' | 'hard'
    public string DraftAnswer { get; set; } = string.Empty;
    public string? Tips { get; set; }
}
