using System.ComponentModel.DataAnnotations;
using JobTracker.Core.Entities;

namespace JobTracker.Application.DTOs.Documents;

/// <summary>
/// DTO for returning document metadata.
/// Does not include actual file content - use download endpoint for that.
/// </summary>
public class DocumentDto
{
    public Guid Id { get; set; }
    
    /// <summary>
    /// Original filename as uploaded by the user
    /// </summary>
    public string OriginalFileName { get; set; } = string.Empty;
    
    /// <summary>
    /// File size in bytes
    /// </summary>
    public long FileSize { get; set; }
    
    /// <summary>
    /// MIME type (e.g., "application/pdf")
    /// </summary>
    public string ContentType { get; set; } = string.Empty;
    
    /// <summary>
    /// When the document was uploaded
    /// </summary>
    public DateTime UploadedAt { get; set; }
    
    /// <summary>
    /// Type of document (Resume, CoverLetter, etc.)
    /// </summary>
    public DocumentType Type { get; set; }
    
    /// <summary>
    /// Number of job applications using this document
    /// </summary>
    public int ApplicationCount { get; set; }

    /// <summary>
    /// Indicates if this is the Master document
    /// </summary>
    public bool IsMaster { get; set; }
}

/// <summary>
/// DTO for document upload response.
/// Extends DocumentDto with upload-specific information.
/// </summary>
public class DocumentUploadResponseDto : DocumentDto
{
    /// <summary>
    /// Indicates if the upload was successful
    /// </summary>
    public bool Succeeded { get; set; }
    
    /// <summary>
    /// Message describing the result
    /// </summary>
    public string? Message { get; set; }
}

/// <summary>
/// DTO for updating document metadata.
/// The file itself cannot be updated - upload a new document instead.
/// </summary>
public class UpdateDocumentDto
{
    /// <summary>
    /// New display name for the document
    /// </summary>
    [StringLength(255)]
    public string? DisplayName { get; set; }
    
    /// <summary>
    /// Document type classification
    /// </summary>
    public DocumentType? Type { get; set; }
}
