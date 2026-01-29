namespace JobTracker.Core.Entities;

/// <summary>
/// Represents an uploaded document (CV, Resume, Cover Letter, etc.).
/// Documents are owned by users and can be attached to job applications.
/// Future: Content can be extracted for NLP analysis and comparison.
/// </summary>
public class Document
{
    public Guid Id { get; set; }

    // ============================================
    // USER OWNERSHIP
    // ============================================

    /// <summary>
    /// Foreign key to the user who uploaded this document.
    /// Every document must belong to a user.
    /// </summary>
    public required string UserId { get; set; }

    /// <summary>
    /// Navigation property to the document owner
    /// </summary>
    public ApplicationUser? User { get; set; }

    // ============================================
    // FILE INFORMATION
    // ============================================

    /// <summary>
    /// Stored filename on the server (e.g., "a1b2c3d4.pdf")
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Original filename as uploaded by the user
    /// </summary>
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// MIME type of the file (e.g., "application/pdf")
    /// </summary>
    public string ContentType { get; set; } = "application/pdf";

    /// <summary>
    /// When the document was uploaded
    /// </summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Document type (CV, CoverLetter, Certificate, etc.)
    /// </summary>
    public DocumentType Type { get; set; } = DocumentType.Resume;

    /// <summary>
    /// Indicates if this is the user's "Master" credential (e.g. main CV).
    /// Only one document of a type should be master per user.
    /// </summary>
    public bool IsMaster { get; set; }

    // ============================================
    // NAVIGATION PROPERTIES
    // ============================================

    /// <summary>
    /// Job applications that use this document
    /// </summary>
    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}

/// <summary>
/// Types of documents that can be uploaded
/// </summary>
public enum DocumentType
{
    Resume = 0,
    CoverLetter = 1,
    Certificate = 2,
    Portfolio = 3,
    Other = 99
}
