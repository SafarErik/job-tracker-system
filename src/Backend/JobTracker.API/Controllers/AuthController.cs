using System.Security.Claims;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobTracker.Application.DTOs.Auth;
using JobTracker.Application.Interfaces;

namespace JobTracker.API.Controllers;

/// <summary>
/// Controller for handling user authentication and authorization.
/// Provides endpoints for registration, login, and token management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly string _frontendBaseUrl;

#pragma warning disable S1075 // URIs should not be hardcoded
    private const string DefaultFrontendUrl = "http://localhost:4200";
#pragma warning restore S1075

    public AuthController(
        IAuthService authService,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
        _frontendBaseUrl = configuration["Frontend:BaseUrl"] ?? DefaultFrontendUrl;
    }

    // ============================================
    // REGISTER - Create a new user account
    // ============================================

    /// <summary>
    /// Register a new user account.
    /// POST: api/auth/register
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);

        if (!result.Succeeded)
        {
            _logger.LogWarning("User registration failed: {Message}", result.Message);
            return BadRequest(result);
        }

        _logger.LogInformation("New user registered: {UserId}", result.User?.Id);
        return Ok(result);
    }

    // ============================================
    // LOGIN - Authenticate existing user
    // ============================================

    /// <summary>
    /// Login with email and password.
    /// POST: api/auth/login
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        var result = await _authService.LoginAsync(loginDto);

        if (!result.Succeeded)
        {
            _logger.LogWarning("Failed login attempt.");
            return Unauthorized(result);
        }

        _logger.LogInformation("User logged in: {UserId}", result.User?.Id);
        return Ok(result);
    }

    // ============================================
    // GET CURRENT USER - Return authenticated user info
    // ============================================

    /// <summary>
    /// Get the currently authenticated user's information.
    /// GET: api/auth/me
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        // This endpoint might need to fetch fresh data if token is stale but still valid.
        // However, standard pattern is to rely on token claims or refreshed token.
        // For simplicity, we decode claims or just use RefreshToken logic if we want fresh data?
        // Actually, normally 'me' endpoint returns UserDto based on ID.
        // We can reuse RefreshTokenAsync to get fresh user data + token, OR just get user.
        // IAuthService doesn't have GetUserById.
        // But RefreshTokenAsync returns AuthResponseDto with UserDto.
        // Let's use that or rely on claims.
        // For now, let's keep it simple and just use RefreshTokenAsync which validates user exists.

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null) return NotFound();

        return Ok(user);
    }

    // ============================================
    // REFRESH TOKEN - Get a new token
    // ============================================

    /// <summary>
    /// Refresh the JWT token for an authenticated user.
    /// POST: api/auth/refresh
    /// </summary>
    [HttpPost("refresh")]
    [Authorize]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var result = await _authService.RefreshTokenAsync(userId);
        if (!result.Succeeded) return Unauthorized(result);

        return Ok(result);
    }

    // ============================================
    // GOOGLE OAUTH - External authentication
    // ============================================

    /// <summary>
    /// Initiates Google OAuth login flow.
    /// This redirects the user to Google's login page.
    /// GET: api/auth/google-login
    /// </summary>
    [HttpGet("google-login")]
    [AllowAnonymous]
    public IActionResult GoogleLogin([FromQuery] string? returnUrl = null)
    {
        var sanitizedReturnUrl = SanitizeReturnUrl(returnUrl);

        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(GoogleCallback)),
            Items = { { "returnUrl", sanitizedReturnUrl } }
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    /// <summary>
    /// Callback endpoint for Google OAuth.
    /// Google redirects here after the user authenticates.
    /// GET: api/auth/google-callback
    /// </summary>
    [HttpGet("google-callback")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleCallback()
    {
        var authenticateResult = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

        if (!authenticateResult.Succeeded)
        {
            _logger.LogWarning("Google authentication failed: {Error}", authenticateResult.Failure?.Message);
            return Redirect($"{_frontendBaseUrl}/login?error=google_auth_failed");
        }

        var claims = authenticateResult.Principal?.Identities.FirstOrDefault()?.Claims.ToList();
        if (claims == null) return Redirect($"{_frontendBaseUrl}/login?error=no_claims");

        var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email)) return Redirect($"{_frontendBaseUrl}/login?error=no_email");

        var firstName = claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? "";
        var lastName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value ?? "";
        var profilePicture = claims.FirstOrDefault(c => c.Type == "picture")?.Value;

        var externalUser = new ExternalUserDto
        {
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            ProfilePictureUrl = profilePicture
        };

        var result = await _authService.HandleExternalLoginAsync(externalUser);

        if (!result.Succeeded)
        {
            return Redirect($"{_frontendBaseUrl}/login?error=create_failed");
        }

        var returnUrl = SanitizeReturnUrl(authenticateResult.Properties?.Items["returnUrl"]);
        return Redirect($"{returnUrl}/auth/callback?token={result.Token}");
    }

    /// <summary>
    /// Alternative: Google login with ID token (for mobile apps or SPA direct integration).
    /// POST: api/auth/google-token
    /// </summary>
    [HttpPost("google-token")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> GoogleTokenLogin([FromBody] GoogleTokenDto googleTokenDto)
    {
        var result = await _authService.GoogleLoginAsync(googleTokenDto);

        if (!result.Succeeded)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    private string SanitizeReturnUrl(string? returnUrl)
    {
        if (string.IsNullOrWhiteSpace(returnUrl)) return _frontendBaseUrl;

        if (!Uri.TryCreate(returnUrl, UriKind.Absolute, out var returnUri)) return _frontendBaseUrl;
        if (!Uri.TryCreate(_frontendBaseUrl, UriKind.Absolute, out var frontendUri)) return _frontendBaseUrl;

        if (!string.Equals(returnUri.Scheme, frontendUri.Scheme, StringComparison.OrdinalIgnoreCase) ||
            !string.Equals(returnUri.Host, frontendUri.Host, StringComparison.OrdinalIgnoreCase) ||
            returnUri.Port != frontendUri.Port)
        {
            return _frontendBaseUrl;
        }

        return returnUrl;
    }
}
