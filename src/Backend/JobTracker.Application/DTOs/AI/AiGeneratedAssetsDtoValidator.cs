using FluentValidation;

namespace JobTracker.Application.DTOs.AI;

/// <summary>
/// Validator for AiGeneratedAssetsDto.
/// </summary>
public class AiGeneratedAssetsDtoValidator : AbstractValidator<AiGeneratedAssetsDto>
{
    public AiGeneratedAssetsDtoValidator()
    {
        RuleFor(x => x.MatchScore)
            .InclusiveBetween(0, 100).WithMessage("Match score must be between 0 and 100");

        RuleFor(x => x.GoodPoints)
            .NotNull().WithMessage("Good points list cannot be null");

        RuleFor(x => x.Gaps)
            .NotNull().WithMessage("Gaps list cannot be null");

        RuleFor(x => x.Advice)
            .NotNull().WithMessage("Advice list cannot be null");
    }
}
