using JobTracker.Application.DTOs.Auth;
using JobTracker.Core.Entities;

namespace JobTracker.Application.Interfaces;

/// <summary>
/// Interface for authentication operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user.
    /// </summary>
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);

    /// <summary>
    /// Authenticates a user with email and password.
    /// </summary>
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);

    /// <summary>
    /// Generates a JWT token for the specified user.
    /// </summary>
    string GenerateJwtToken(ApplicationUser user);

    /// <summary>
    /// Authenticates a user via Google OAuth token.
    /// </summary>
    Task<AuthResponseDto> GoogleLoginAsync(GoogleTokenDto googleTokenDto);

    /// <summary>
    /// Refreshes the authentication token for a user.
    /// </summary>
    Task<AuthResponseDto> RefreshTokenAsync(string userId);

    /// <summary>
    /// Handles login/registration for an external authentication provider (e.g., Google OAuth callback).
    /// Creates a new user if one doesn't exist, or updates profile info for returning users.
    /// </summary>
    Task<AuthResponseDto> HandleExternalLoginAsync(ExternalUserDto externalUser);
}
