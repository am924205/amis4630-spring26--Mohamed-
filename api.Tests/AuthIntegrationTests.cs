using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BuckeyeMarketplaceApi.Dtos;
using Xunit;

namespace BuckeyeMarketplaceApi.Tests;

public class AuthIntegrationTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthIntegrationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Cart_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/cart");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RegisterThenGetCart_WithToken_Returns200()
    {
        var client = _factory.CreateClient();

        var register = new RegisterRequest
        {
            Email = $"int-{Guid.NewGuid():N}@osu.edu",
            Password = "Abcdef12",
            DisplayName = "Integration Tester"
        };
        var regResp = await client.PostAsJsonAsync("/api/auth/register", register);
        Assert.Equal(HttpStatusCode.OK, regResp.StatusCode);
        var auth = await regResp.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        Assert.False(string.IsNullOrWhiteSpace(auth!.Token));

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);
        var cartResp = await client.GetAsync("/api/cart");
        Assert.Equal(HttpStatusCode.OK, cartResp.StatusCode);
    }

    [Fact]
    public async Task AdminProductEndpoint_WithUserRole_Returns403()
    {
        var client = _factory.CreateClient();

        var register = new RegisterRequest
        {
            Email = $"int-{Guid.NewGuid():N}@osu.edu",
            Password = "Abcdef12",
            DisplayName = "Reg User"
        };
        var regResp = await client.PostAsJsonAsync("/api/auth/register", register);
        var auth = await regResp.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.Token);

        var payload = new
        {
            title = "Forbidden product",
            description = "Should not be created by a non-admin",
            price = 1.00m,
            category = "Misc",
            sellerName = "x",
            postedDate = DateTime.UtcNow,
            imageUrl = "https://example.com/x.jpg"
        };
        var resp = await client.PostAsJsonAsync("/api/products", payload);
        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
    }
}
