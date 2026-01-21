using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using JobTracker.Core.Entities;
using JobTracker.API.DTOs.Auth;

namespace JobTracker.API.Controllers;

/// <summary>
/// Controller for handling user authentication and authorization.
/// Provides endpoints for registration, login, and token management.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // UserManager - handles user creation, password validation, etc.
    private readonly UserManager<ApplicationUser> _userManager;
    
    // SignInManager - handles sign-in logic and external authentication
    private readonly SignInManager<ApplicationUser> _signInManager;
    
    // Configuration for JWT settings
    private readonly IConfiguration _configuration;
    
    // Logger for debugging and monitoring
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _logger = logger;
    }

    // ============================================
    // REGISTER - Create a new user account
    // ============================================

    /// <summary>
    /// Register a new user account.
    /// POST: api/auth/register
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous] // Anyone can register (no authentication required)
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        // Check if email is already taken
        var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
        if (existingUser != null)
        {
            return BadRequest(new AuthResponseDto
            {
                Succeeded = false,
                Message = "Email is already registered"
            });
        }

        // Create new user entity
        var user = new ApplicationUser
        {
            UserName = registerDto.Email, // Use email as username
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            CreatedAt = DateTime.UtcNow
        };

        // Create user with password (password will be hashed automatically)
        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            // Return validation errors (e.g., password too weak)
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("User registration failed: {Errors}", errors);
            
            return BadRequest(new AuthResponseDto
            {
                Succeeded = false,
                Message = errors
            });
        }

        _logger.LogInformation("New user registered: {Email}", user.Email);

        // Generate JWT token for immediate login after registration
        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Succeeded = true,
            Message = "Registration successful",
            Token = token,
            User = MapUserToDto(user)
        });
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
        // Find user by email
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
        {
            _logger.LogWarning("Login attempt with non-existent email: {Email}", loginDto.Email);
            return Unauthorized(new AuthResponseDto
            {
                Succeeded = false,
                Message = "Invalid email or password"
            });
        }

        // Check if account is locked out
        if (await _userManager.IsLockedOutAsync(user))
        {
            _logger.LogWarning("Login attempt on locked account: {Email}", loginDto.Email);
            return Unauthorized(new AuthResponseDto
            {
                Succeeded = false,
                Message = "Account is temporarily locked. Please try again later."
            });
        }

        // Validate password
        var result = await _signInManager.CheckPasswordSignInAsync(
            user, 
            loginDto.Password, 
            lockoutOnFailure: true // Enable lockout on failed attempts
        );

        if (!result.Succeeded)
        {
            _logger.LogWarning("Failed login attempt for: {Email}", loginDto.Email);
            return Unauthorized(new AuthResponseDto
            {
                Succeeded = false,
                Message = "Invalid email or password"
            });
        }

        // Update last login timestamp
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        _logger.LogInformation("User logged in: {Email}", user.Email);

        // Generate JWT token
        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Succeeded = true,
            Message = "Login successful",
            Token = token,
            User = MapUserToDto(user)
        });
    }

    // ============================================
    // GET CURRENT USER - Return authenticated user info
    // ============================================

    /// <summary>
    /// Get the currently authenticated user's information.
    /// GET: api/auth/me
    /// </summary>
    [HttpGet("me")]
    [Authorize] // Requires valid JWT token
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        // Get user ID from JWT token claims
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(MapUserToDto(user));
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
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponseDto
        {
            Succeeded = true,
            Message = "Token refreshed",
            Token = token,
            User = MapUserToDto(user)
        });
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /// <summary>
    /// Generates a JWT token for the specified user.
    /// The token contains user claims that identify the user and their permissions.
    /// </summary>
    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] 
            ?? throw new InvalidOperationException("JWT SecretKey not configured");
        
        // Create signing credentials using the secret key
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Define claims - these are pieces of information about the user
        // that will be encoded in the token
        var claims = new List<Claim>
        {
            // Standard claims
            new Claim(ClaimTypes.NameIdentifier, user.Id), // User's unique ID
            new Claim(ClaimTypes.Email, user.Email ?? ""),  // User's email
            new Claim(ClaimTypes.Name, user.UserName ?? ""), // Username
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token ID
            
            // Custom claims for our application
            new Claim("firstName", user.FirstName ?? ""),
            new Claim("lastName", user.LastName ?? "")
        };

        // Get token expiration from configuration
        var expirationMinutes = int.Parse(
            jwtSettings["AccessTokenExpirationMinutes"] ?? "60");

        // Create the token
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        // Serialize the token to a string
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Maps an ApplicationUser entity to a UserDto for API responses.
    /// </summary>
    private static UserDto MapUserToDto(ApplicationUser user)
    {
        return new UserDto
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
