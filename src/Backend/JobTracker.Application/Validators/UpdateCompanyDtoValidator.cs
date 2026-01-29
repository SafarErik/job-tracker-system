using FluentValidation;
using JobTracker.Application.DTOs.Companies;

namespace JobTracker.Application.Validators;

/// <summary>
/// Validator for company update requests.
/// </summary>
public class UpdateCompanyDtoValidator : AbstractValidator<UpdateCompanyDto>
{
    public UpdateCompanyDtoValidator()
    {
        RuleFor(x => x.Name)
            .MinimumLength(2).WithMessage("Company name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Company name must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Website)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
            .WithMessage("Invalid website URL format")
            .When(x => !string.IsNullOrEmpty(x.Website));

        RuleFor(x => x.Priority)
            .Must(p => new[] { "Tier1", "Tier2", "Tier3" }.Contains(p))
            .WithMessage("Priority must be one of: Tier1, Tier2, Tier3")
            .When(x => !string.IsNullOrEmpty(x.Priority));
            
        RuleForEach(x => x.Contacts).ChildRules(contact => 
        {
            contact.RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Contact name is required");
                
            contact.RuleFor(c => c.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .When(c => !string.IsNullOrEmpty(c.Email));
        });
    }
}
