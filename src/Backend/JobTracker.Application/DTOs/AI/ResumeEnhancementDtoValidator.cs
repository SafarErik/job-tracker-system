using FluentValidation;

namespace JobTracker.Application.DTOs.AI;

public class ResumeEnhancementDtoValidator : AbstractValidator<ResumeEnhancementDto>
{
    public ResumeEnhancementDtoValidator()
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.OriginalBullet)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(x => x.RebrandedBullet)
            .NotEmpty()
            .MaximumLength(500);

        RuleFor(x => x.Reasoning)
            .MaximumLength(1000);

        RuleFor(x => x.Category)
            .NotEmpty()
            .Must(category => new[] { "experience", "skill", "achievement" }.Contains(category))
            .WithMessage("Category must be one of: 'experience', 'skill', 'achievement'");
    }
}
