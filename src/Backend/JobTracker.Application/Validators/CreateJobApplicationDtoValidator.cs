using FluentValidation;
using JobTracker.Application.DTOs.JobApplications;
using JobTracker.Core.Enums;

namespace JobTracker.Application.Validators;

/// <summary>
/// Validator for CreateJobApplicationDto.
/// </summary>
public class CreateJobApplicationDtoValidator : AbstractValidator<CreateJobApplicationDto>
{
    public CreateJobApplicationDtoValidator()
    {
        RuleFor(x => x.Position)
            .NotEmpty().WithMessage("Position is required")
            .MaximumLength(200).WithMessage("Position must not exceed 200 characters");

        RuleFor(x => x.CompanyId)
            .NotEmpty().WithMessage("Company is required");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid status");

        RuleFor(x => x.JobType)
            .IsInEnum().WithMessage("Invalid job type");

        RuleFor(x => x.WorkplaceType)
            .IsInEnum().WithMessage("Invalid workplace type");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid priority");

        RuleFor(x => x.JobUrl)
            .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Invalid job URL format");

        RuleFor(x => x.SalaryOffer)
            .GreaterThanOrEqualTo(0).WithMessage("Salary offer must be positive")
            .When(x => x.SalaryOffer.HasValue);

        RuleFor(x => x.MatchScore)
            .InclusiveBetween(0, 100).WithMessage("Match score must be between 0 and 100");

        // GUID validation for DocumentId and PrimaryContactId (optional but must be valid if provided)
        RuleFor(x => x.DocumentId)
            .NotEqual(Guid.Empty).WithMessage("Invalid document ID")
            .When(x => x.DocumentId.HasValue);

        RuleFor(x => x.PrimaryContactId)
            .NotEqual(Guid.Empty).WithMessage("Invalid primary contact ID")
            .When(x => x.PrimaryContactId.HasValue);
    }
}
