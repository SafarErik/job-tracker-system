using FluentValidation;
using JobTracker.Application.DTOs.ApplicationTimelineEvent;
using JobTracker.Core.Enums;

namespace JobTracker.Application.Validators;

public class CreateApplicationTimelineEventDtoValidator : AbstractValidator<CreateApplicationTimelineEventDto>
{
    public CreateApplicationTimelineEventDtoValidator()
    {
        RuleFor(x => x.JobApplicationId)
            .NotEmpty().WithMessage("Job Application ID is required");

        RuleFor(x => x.OccurredAt)
            .NotEmpty().WithMessage("Date and time is required")
            .LessThanOrEqualTo(DateTime.UtcNow.AddMinutes(5)).WithMessage("Event date cannot be in the future");

        RuleFor(x => x.EventType)
            .IsInEnum().WithMessage("Invalid event type");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .Length(2, 150).WithMessage("Title must be between 2 and 150 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters");

        RuleFor(x => x.DueDate)
            .GreaterThan(x => x.OccurredAt).WithMessage("Due date must be after the event date")
            .When(x => x.DueDate.HasValue);
    }
}
