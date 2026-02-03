using FluentValidation;
using JobTracker.Application.DTOs.JobApplications;

namespace JobTracker.Application.Validators;

/// <summary>
/// Validator for UpdateJobApplicationDto.
/// </summary>
public class UpdateJobApplicationDtoValidator : AbstractValidator<UpdateJobApplicationDto>
{
    public UpdateJobApplicationDtoValidator()
    {
        RuleFor(x => x.RowVersion)
            .NotEmpty().WithMessage("RowVersion is required for concurrency control");

        RuleFor(x => x.Position)
            .NotEmpty().WithMessage("Position cannot be empty")
            .MaximumLength(200).WithMessage("Position must not exceed 200 characters")
            .When(x => x.Position != null);

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid status")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.JobType)
            .IsInEnum().WithMessage("Invalid job type")
            .When(x => x.JobType.HasValue);

        RuleFor(x => x.WorkplaceType)
            .IsInEnum().WithMessage("Invalid workplace type")
            .When(x => x.WorkplaceType.HasValue);

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid priority")
            .When(x => x.Priority.HasValue);

        RuleFor(x => x.JobUrl)
            .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Invalid job URL format")
            .When(x => !string.IsNullOrEmpty(x.JobUrl));

        RuleFor(x => x.SalaryOffer)
            .GreaterThanOrEqualTo(0).WithMessage("Salary offer must be positive")
            .When(x => x.SalaryOffer.HasValue);

        RuleFor(x => x.MatchScore)
            .InclusiveBetween(0, 100).WithMessage("Match score must be between 0 and 100")
            .When(x => x.MatchScore.HasValue);

        RuleFor(x => x.DocumentId)
            .NotEqual(Guid.Empty).WithMessage("Invalid document ID")
            .When(x => x.DocumentId.HasValue && x.DocumentId != Guid.Empty);

        RuleFor(x => x.PrimaryContactId)
            .NotEqual(Guid.Empty).WithMessage("Invalid primary contact ID")
            .When(x => x.PrimaryContactId.HasValue && x.PrimaryContactId != Guid.Empty);
    }
}
