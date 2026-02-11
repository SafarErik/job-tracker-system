using FluentValidation;
using JobTracker.Application.DTOs.Auth;

namespace JobTracker.Application.Validators;

public class GoogleTokenDtoValidator : AbstractValidator<GoogleTokenDto>
{
    public GoogleTokenDtoValidator()
    {
        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("ID Token is required");
    }
}
