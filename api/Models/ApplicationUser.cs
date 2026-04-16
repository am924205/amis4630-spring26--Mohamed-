using Microsoft.AspNetCore.Identity;

namespace BuckeyeMarketplaceApi.Models;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}
