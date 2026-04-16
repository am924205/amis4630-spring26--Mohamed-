using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using BuckeyeMarketplaceApi.Dtos;
using BuckeyeMarketplaceApi.Models;
using BuckeyeMarketplaceApi.Services;

namespace BuckeyeMarketplaceApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly JwtTokenService _tokenService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        JwtTokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing != null)
            return Conflict(new { message = "An account with this email already exists." });

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Registration failed.",
                errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        await _userManager.AddToRoleAsync(user, "User");

        var (token, expiresAt, roles) = await _tokenService.CreateTokenAsync(user);
        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            Roles = roles.ToList(),
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid email or password." });

        var (token, expiresAt, roles) = await _tokenService.CreateTokenAsync(user);
        return Ok(new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            Roles = roles.ToList(),
            ExpiresAt = expiresAt
        });
    }
}
