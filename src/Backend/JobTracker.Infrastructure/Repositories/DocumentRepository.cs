using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Document entities.
/// Handles all database operations for user documents.
/// </summary>
public class DocumentRepository : IDocumentRepository
{
    private readonly ApplicationDbContext _context;

    public DocumentRepository(ApplicationDbContext context) => _context = context;

    /// <inheritdoc/>
    public async Task<IEnumerable<Document>> GetAllAsync() =>
        await _context.Documents
            .AsNoTracking()
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<IEnumerable<Document>> GetAllByUserIdAsync(string userId) =>
        await _context.Documents
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<Document?> GetByIdAsync(Guid id) =>
        await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);

    /// <inheritdoc/>
    public async Task<Document> CreateAsync(Document document)
    {
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return document;
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id) =>
        await _context.Documents
            .Where(d => d.Id == id)
            .ExecuteDeleteAsync();

    /// <inheritdoc/>
    public async Task<bool> ExistsAsync(Guid id) =>
        await _context.Documents.AnyAsync(d => d.Id == id);

    /// <inheritdoc/>
    public async Task UpdateAsync(Document document)
    {
        _context.Documents.Update(document);
        await _context.SaveChangesAsync();
    }
}
