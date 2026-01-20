namespace JobTracker.Core.Entities;

public class Document
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty; // Stored filename (e.g., guid.pdf)
    public string OriginalFileName { get; set; } = string.Empty; // Original uploaded filename
    public long FileSize { get; set; } // Size in bytes
    public string ContentType { get; set; } = "application/pdf";
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}
