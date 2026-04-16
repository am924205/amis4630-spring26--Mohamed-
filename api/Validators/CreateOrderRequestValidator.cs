using FluentValidation;
using BuckeyeMarketplaceApi.Dtos;

namespace BuckeyeMarketplaceApi.Validators;

public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.ShippingAddress)
            .NotEmpty().WithMessage("Shipping address is required.")
            .MaximumLength(500);
    }
}
