using FluentValidation;
using System;

namespace JobTracker.Application.DTOs.Notifications;

/// <summary>
/// Validator for NotificationDto.
/// </summary>
public class NotificationDtoValidator : AbstractValidator<NotificationDto>
{
    public NotificationDtoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Notification ID is required");

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid notification type");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("Message is required")
            .MaximumLength(1000).WithMessage("Message cannot exceed 1000 characters");

        RuleFor(x => x.Timestamp)
            .NotEqual(default(DateTime)).WithMessage("Valid timestamp is required")
            .GreaterThan(DateTime.MinValue).WithMessage("Timestamp must be a valid date");
    }
}
