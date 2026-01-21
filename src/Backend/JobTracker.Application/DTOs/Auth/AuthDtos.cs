using System.ComponentModel.DataAnnotations;

namespace JobTracker.Application.DTOs.Auth;

/// <summary>
/// DTO for user registration requests.
/// Contains all required information to create a new user account.
/// </summary>
public class RegisterDto
{
    /// <summary>
    /// User's email address - will also be used as username.
    /// Must be unique in the system.
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password.
    /// Must meet complexity requirements configured in Identity.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Password confirmation - must match Password.
    /// </summary>
    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>
    /// User's first name for personalization.
    /// </summary>
    [Required(ErrorMessage = "First name is required")]
    [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name for personalization.
    /// </summary>
    [Required(ErrorMessage = "Last name is required")]
    [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
    public string LastName { get; set; } = string.Empty;
}

/// <summary>
/// DTO for login requests.
/// </summary>
public class LoginDto
{
    /// <summary>
    /// User's email address.
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's password.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Optional: Remember the user for longer sessions.
    /// </summary>
    public bool RememberMe { get; set; } = false;
}

/// <summary>
/// DTO for authentication responses.
/// Returns status, message, JWT token, and user information.
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Indicates if the authentication operation succeeded.
    /// </summary>
    public bool Succeeded { get; set; }

    /// <summary>
    /// Message describing the result (success or error details).
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// JWT access token for authenticated requests.
    /// Only present on successful authentication.
    /// </summary>
    public string? Token { get; set; }

    /// <summary>
    /// Token expiration time in UTC.
    /// Frontend can use this to know when to refresh.
    /// </summary>
    public DateTime? TokenExpiration { get; set; }

    /// <summary>
    /// User information.
    /// Only present on successful authentication.
    /// </summary>
    public UserDto? User { get; set; }
}

/// <summary>
/// DTO for user information in API responses.
/// Contains safe-to-expose user properties (no password hash, etc.).
/// </summary>
public class UserDto
{
    /// <summary>
    /// User's unique identifier.
    /// </summary>
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// User's email address.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's first name.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// User's last name.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Computed full name.
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();

    /// <summary>
    /// URL to user's profile picture.
    /// </summary>
    public string? ProfilePictureUrl { get; set; }

    /// <summary>
    /// User's current job title.
    /// </summary>
    public string? CurrentJobTitle { get; set; }

    /// <summary>
    /// Years of professional experience.
    /// </summary>
    public int? YearsOfExperience { get; set; }

    /// <summary>
    /// When the account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for updating user profile information.
/// All fields are optional - only provided fields will be updated.
/// </summary>
public class UpdateProfileDto
{
    [StringLength(50)]
    public string? FirstName { get; set; }

    [StringLength(50)]
    public string? LastName { get; set; }

    public string? CurrentJobTitle { get; set; }

    public int? YearsOfExperience { get; set; }

    public string? Bio { get; set; }

    public string? ProfilePictureUrl { get; set; }
}

/// <summary>
/// DTO for changing password.
/// Requires current password for security verification.
/// </summary>
public class ChangePasswordDto
{
    [Required(ErrorMessage = "Current password is required")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "New password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string NewPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password confirmation is required")]
    [Compare("NewPassword", ErrorMessage = "Passwords do not match")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
