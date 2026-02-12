using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ApplicationTimelineEvent entities.
/// </summary>
public class ApplicationTimelineEventRepository : IApplicationTimelineEventRepository
{
    private readonly ApplicationDbContext _context;

    public ApplicationTimelineEventRepository(ApplicationDbContext context) => _context = context;

    /// <inheritdoc/>
    public async Task<IEnumerable<ApplicationTimelineEvent>> GetByApplicationIdAsync(Guid jobApplicationId) =>
        await _context.TimelineEvents
            .AsNoTracking()
            .Where(e => e.JobApplicationId == jobApplicationId)
            .Include(e => e.RelatedDocument)
            .OrderBy(e => e.OccurredAt)
            .ToListAsync();

    /// <inheritdoc/>
    public async Task<ApplicationTimelineEvent?> GetByIdAsync(Guid id) =>
        await _context.TimelineEvents
            .Include(e => e.RelatedDocument)
            .FirstOrDefaultAsync(e => e.Id == id);

    /// <inheritdoc/>
    public async Task<Guid> AddAsync(ApplicationTimelineEvent timelineEvent)
    {
        await _context.TimelineEvents.AddAsync(timelineEvent);
        await _context.SaveChangesAsync();
        return timelineEvent.Id;
    }

    /// <inheritdoc/>
    public async Task UpdateAsync(ApplicationTimelineEvent timelineEvent)
    {
        _context.TimelineEvents.Update(timelineEvent);
        await _context.SaveChangesAsync();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id) =>
        await _context.TimelineEvents
            .Where(e => e.Id == id)
            .ExecuteDeleteAsync();
}
