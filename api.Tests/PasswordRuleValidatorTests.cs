using BuckeyeMarketplaceApi.Services;
using Xunit;

namespace BuckeyeMarketplaceApi.Tests;

public class PasswordRuleValidatorTests
{
    [Theory]
    [InlineData("Abcdef12", true)]
    [InlineData("StrongPass1", true)]
    [InlineData("short1A", false)]   // too short
    [InlineData("alllowercase1", false)] // no uppercase
    [InlineData("NoDigitsHere", false)] // no digit
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsValid_AppliesPasswordRules(string? password, bool expected)
    {
        Assert.Equal(expected, PasswordRuleValidator.IsValid(password));
    }
}
