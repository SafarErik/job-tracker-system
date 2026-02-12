using Google.Apis.Auth;
using JobTracker.Application.DTOs.Auth;
using JobTracker.Application.Interfaces;
using JobTracker.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JobTracker.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
    {
        var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingUser != null)
        {
            return new AuthResponseDto { Succeeded = false, Message = "Email is already registered" };
        }

        var user = new ApplicationUser
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new AuthResponseDto { Succeeded = false, Message = errors };
        }

        var (token, expiration) = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Succeeded = true,
            Message = "Registration successful",
            Token = token,
            TokenExpiration = expiration,
            User = MapUserToDto(user)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            return new AuthResponseDto { Succeeded = false, Message = "Invalid email or password" };
        }

        if (await _userManager.IsLockedOutAsync(user))
        {
            return new AuthResponseDto { Succeeded = false, Message = "Account is temporarily locked" };
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);
        if (!result.Succeeded)
        {
            return new AuthResponseDto { Succeeded = false, Message = "Invalid email or password" };
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var (token, expiration) = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Succeeded = true,
            Message = "Login successful",
            Token = token,
            TokenExpiration = expiration,
            User = MapUserToDto(user)
        };
    }

    public async Task<AuthResponseDto> GoogleLoginAsync(GoogleTokenDto googleTokenDto)
    {
        try
        {
            var googleClientId = _configuration["Authentication:Google:ClientId"];
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(googleTokenDto.IdToken, validationSettings);

            var user = await _userManager.FindByEmailAsync(payload.Email);
            if (user == null)
            {
                user = new ApplicationUser
                {
                    UserName = payload.Email,
                    Email = payload.Email,
                    EmailConfirmed = true,
                    FirstName = payload.GivenName ?? "",
                    LastName = payload.FamilyName ?? "",
                    ProfilePictureUrl = payload.Picture,
                    CreatedAt = DateTime.UtcNow,
                    IsExternalAccount = true,
                    ExternalProvider = "Google"
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return new AuthResponseDto { Succeeded = false, Message = "Failed to create user account" };
                }
            }
            else
            {
                // Update profile picture slightly lazily
                if (!string.IsNullOrEmpty(payload.Picture) && user.ProfilePictureUrl != payload.Picture)
                {
                    user.ProfilePictureUrl = payload.Picture;
                    await _userManager.UpdateAsync(user);
                }
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var (token, expiration) = GenerateJwtToken(user);
            return new AuthResponseDto
            {
                Succeeded = true,
                Message = "Google login successful",
                Token = token,
                TokenExpiration = expiration,
                User = MapUserToDto(user)
            };
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Invalid Google token");
            return new AuthResponseDto { Succeeded = false, Message = "Invalid or expired Google token" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Google token login");
            return new AuthResponseDto { Succeeded = false, Message = "Authentication failed" };
        }
    }

    public async Task<AuthResponseDto> HandleExternalLoginAsync(ExternalUserDto externalUser)
    {
        var user = await _userManager.FindByEmailAsync(externalUser.Email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = externalUser.Email,
                Email = externalUser.Email,
                EmailConfirmed = true,
                FirstName = externalUser.FirstName,
                LastName = externalUser.LastName,
                ProfilePictureUrl = externalUser.ProfilePictureUrl,
                CreatedAt = DateTime.UtcNow,
                IsExternalAccount = true,
                ExternalProvider = externalUser.FirstName != "Unknown" ? "External" : "Unknown" // Or pass provider in DTO
            };

            var createResult = await _userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                return new AuthResponseDto { Succeeded = false, Message = $"Failed to create user: {errors}" };
            }
        }
        else
        {
            if (!string.IsNullOrEmpty(externalUser.ProfilePictureUrl) && user.ProfilePictureUrl != externalUser.ProfilePictureUrl)
            {
                user.ProfilePictureUrl = externalUser.ProfilePictureUrl;
                await _userManager.UpdateAsync(user);
            }
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var (token, expiration) = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Succeeded = true,
            Message = "External login successful",
            Token = token,
            TokenExpiration = expiration,
            User = MapUserToDto(user)
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return new AuthResponseDto { Succeeded = false, Message = "User not found" };

        var (token, expiration) = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Succeeded = true,
            Message = "Token refreshed",
            Token = token,
            TokenExpiration = expiration,
            User = MapUserToDto(user)
        };
    }

    public (string Token, DateTime Expiration) GenerateJwtToken(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey not configured");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("firstName", user.FirstName ?? ""),
            new Claim("lastName", user.LastName ?? "")
        };

        if (!int.TryParse(jwtSettings["AccessTokenExpirationMinutes"], out var expirationMinutes))
        {
            expirationMinutes = 60;
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), token.ValidTo);
    }

    public async Task<UserDto?> GetUserByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user == null ? null : MapUserToDto(user);
    }

    private static UserDto MapUserToDto(ApplicationUser user)
    {
        return new JobTracker.Application.DTOs.Auth.UserDto
        {
            Id = user.Id,
            Email = user.Email ?? "",
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CurrentJobTitle = user.CurrentJobTitle,
            YearsOfExperience = user.YearsOfExperience,
            CreatedAt = user.CreatedAt
        };
    }
}
