using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Enums;

namespace JobTracker.Core.Entities;

/// <summary>
/// Represents an uploaded document (CV, Resume, Cover Letter, etc.).
/// Documents are owned by users and can be attached to job applications.
/// Future: Content can be extracted for NLP analysis and comparison.
/// </summary>
public class Document
{
    /// <summary>
    /// Unique identifier for the document.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the user who uploaded this document.
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// Navigation property to the document owner.
    /// </summary>
    public ApplicationUser? User { get; set; }

    /// <summary>
    /// Stored filename on the server (e.g., "a1b2c3d4.pdf").
    /// </summary>
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Original filename as uploaded by the user.
    /// </summary>
    [StringLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes.
    /// </summary>
    [Range(0, 10485760)]
    public long FileSize { get; set; }

    /// <summary>
    /// MIME type of the file (e.g., "application/pdf").
    /// </summary>
    [StringLength(100)]
    public string ContentType { get; set; } = "application/pdf";

    /// <summary>
    /// Timestamp when the document was uploaded.
    /// </summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// The type of document (CV, CoverLetter, Certificate, etc.).
    /// </summary>
    public DocumentType Type { get; set; } = DocumentType.Resume;

    /// <summary>
    /// Indicates if this is the user's "Master" credential (e.g. main CV).
    /// </summary>
    public bool IsMaster { get; set; }

    /// <summary>
    /// Extracted plain text content of the document.
    /// </summary>
    public string? ParsedContent { get; set; }

    /// <summary>
    /// AI-generated summary of the document content.
    /// </summary>
    public string? AiSummary { get; set; }

    /// <summary>
    /// Job applications that use this document.
    /// </summary>
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}
