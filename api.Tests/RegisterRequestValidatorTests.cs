using BuckeyeMarketplaceApi.Dtos;
using BuckeyeMarketplaceApi.Validators;
using Xunit;

namespace BuckeyeMarketplaceApi.Tests;

public class RegisterRequestValidatorTests
{
    private readonly RegisterRequestValidator _v = new();

    [Fact]
    public void Valid_WhenAllFieldsCorrect()
    {
        var r = new RegisterRequest { Email = "good@osu.edu", Password = "Abcdef12", DisplayName = "Fae" };
        var result = _v.Validate(r);
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Invalid_WhenEmailMalformed()
    {
        var r = new RegisterRequest { Email = "notanemail", Password = "Abcdef12", DisplayName = "Fae" };
        var result = _v.Validate(r);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Email");
    }

    [Fact]
    public void Invalid_WhenPasswordMissingDigit()
    {
        var r = new RegisterRequest { Email = "good@osu.edu", Password = "Abcdefgh", DisplayName = "Fae" };
        var result = _v.Validate(r);
        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "Password");
    }
}
