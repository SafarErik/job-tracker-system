using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

/// <summary>
/// Repository interface for Document entities.
/// Provides data access methods for document management.
/// </summary>
public interface IDocumentRepository
{
    /// <summary>
    /// Gets all documents (admin use only)
    /// </summary>
    Task<IEnumerable<Document>> GetAllAsync();

    /// <summary>
    /// Gets all documents for a specific user
    /// </summary>
    /// <param name="userId">The user's ID</param>
    Task<IEnumerable<Document>> GetAllByUserIdAsync(string userId);

    /// <summary>
    /// Gets a single document by ID
    /// </summary>
    Task<Document?> GetByIdAsync(Guid id);

    /// <summary>
    /// Creates a new document
    /// </summary>
    Task<Document> CreateAsync(Document document);

    /// <summary>
    /// Deletes a document
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Checks if a document exists
    /// </summary>
    Task<bool> ExistsAsync(Guid id);
}
