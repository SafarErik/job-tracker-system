using FluentValidation;

namespace JobTracker.Application.DTOs.AI;

/// <summary>
/// Validator for AiAnalysisResultDto.
/// </summary>
public class AiAnalysisResultDtoValidator : AbstractValidator<AiAnalysisResultDto>
{
    public AiAnalysisResultDtoValidator()
    {
        RuleFor(x => x.MatchScore)
            .InclusiveBetween(0, 100).WithMessage("Match score must be between 0 and 100")
            .When(x => x.Success);

        RuleFor(x => x.GapAnalysis)
            .NotEmpty().WithMessage("Gap analysis cannot be empty")
            .When(x => x.Success);

        RuleFor(x => x.StrategicAdvice)
            .NotEmpty().WithMessage("Strategic advice cannot be empty")
            .When(x => x.Success);

        RuleFor(x => x.MissingSkills)
            .NotNull().WithMessage("Missing skills list cannot be null")
            .When(x => x.Success);

        RuleFor(x => x.ErrorMessage)
            .NotEmpty().WithMessage("Error message is required when analysis fails")
            .When(x => !x.Success);
    }
}
