namespace BuckeyeMarketplaceApi.Services;

public static class PasswordRuleValidator
{
    public static bool IsValid(string? password)
    {
        if (string.IsNullOrEmpty(password)) return false;
        if (password.Length < 8) return false;
        if (!password.Any(char.IsUpper)) return false;
        if (!password.Any(char.IsDigit)) return false;
        return true;
    }
}
