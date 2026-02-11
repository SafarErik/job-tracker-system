using JobTracker.Application.DTOs.ApplicationTimelineEvent;
using JobTracker.Core.Entities;

namespace JobTracker.Application.Mappers;

public static class ApplicationTimelineEventMapper
{
    public static ApplicationTimelineEventDto MapToDto(ApplicationTimelineEvent entity)
    {
        return new ApplicationTimelineEventDto
        {
            Id = entity.Id,
            OccurredAt = entity.OccurredAt,
            EventType = entity.EventType,
            Title = entity.Title,
            Description = entity.Description,
            DueDate = entity.DueDate,
            RelatedDocumentId = entity.RelatedDocumentId
        };
    }
}
