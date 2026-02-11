using FluentValidation;
using JobTracker.Application.DTOs.Skills;

namespace JobTracker.Application.Validators;

public class CreateSkillDtoValidator : AbstractValidator<CreateSkillDto>
{
    public CreateSkillDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Skill name is required.")
            .Length(1, 50).WithMessage("Skill name must be between 1 and 50 characters.");

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category cannot exceed 50 characters.")
            .When(x => !string.IsNullOrEmpty(x.Category));
    }
}
