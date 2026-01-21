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

    public DocumentRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Gets all documents. Use for admin purposes only.
    /// </summary>
    public async Task<IEnumerable<Document>> GetAllAsync()
    {
        return await _context.Documents
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Gets all documents for a specific user.
    /// This is the primary method for user-specific data access.
    /// </summary>
    public async Task<IEnumerable<Document>> GetAllByUserIdAsync(string userId)
    {
        return await _context.Documents
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();
    }

    public async Task<Document?> GetByIdAsync(Guid id)
    {
        return await _context.Documents
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Document> CreateAsync(Document document)
    {
        _context.Documents.Add(document);
        await _context.SaveChangesAsync();
        return document;
    }

    public async Task DeleteAsync(Guid id)
    {
        var document = await GetByIdAsync(id);
        if (document != null)
        {
            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await _context.Documents.AnyAsync(d => d.Id == id);
    }
}
