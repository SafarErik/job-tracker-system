using JobTracker.Core.Entities;

namespace JobTracker.Core.Interfaces;

public interface IDocumentRepository
{
    Task<IEnumerable<Document>> GetAllAsync();
    Task<Document?> GetByIdAsync(Guid id);
    Task<Document> CreateAsync(Document document);
    Task DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
}
