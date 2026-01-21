using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobTracker.Core.Entities;
using JobTracker.Application.DTOs.Auth;
using JobTracker.Infrastructure.Data;

namespace JobTracker.API.Controllers;

/// <summary>
/// Controller for managing user profile information.
/// All endpoints require authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ProfileController> _logger;

    public ProfileController(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context,
        ILogger<ProfileController> logger)
    {
        _userManager = userManager;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's profile information
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CurrentJobTitle = user.CurrentJobTitle,
            YearsOfExperience = user.YearsOfExperience,
            CreatedAt = user.CreatedAt
        };

        return Ok(userDto);
    }

    /// <summary>
    /// Update current user's profile information
    /// </summary>
    [HttpPut]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileDto updateDto)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Update only provided fields
        if (!string.IsNullOrEmpty(updateDto.FirstName))
            user.FirstName = updateDto.FirstName;

        if (!string.IsNullOrEmpty(updateDto.LastName))
            user.LastName = updateDto.LastName;

        if (updateDto.CurrentJobTitle != null)
            user.CurrentJobTitle = updateDto.CurrentJobTitle;

        if (updateDto.YearsOfExperience.HasValue)
            user.YearsOfExperience = updateDto.YearsOfExperience;

        if (updateDto.Bio != null)
            user.Bio = updateDto.Bio;

        if (updateDto.ProfilePictureUrl != null)
            user.ProfilePictureUrl = updateDto.ProfilePictureUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        var userDto = new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            CurrentJobTitle = user.CurrentJobTitle,
            YearsOfExperience = user.YearsOfExperience,
            CreatedAt = user.CreatedAt
        };

        return Ok(userDto);
    }

    /// <summary>
    /// Get profile statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetProfileStats()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var totalApplications = await _context.JobApplications
            .Where(ja => ja.UserId == userId)
            .CountAsync();

        var activeApplications = await _context.JobApplications
            .Where(ja => ja.UserId == userId && ja.Status != Core.Enums.JobApplicationStatus.Rejected && ja.Status != Core.Enums.JobApplicationStatus.Ghosted)
            .CountAsync();

        var interviewsScheduled = await _context.JobApplications
            .Where(ja => ja.UserId == userId && ja.Status == Core.Enums.JobApplicationStatus.Interviewing)
            .CountAsync();

        var offersReceived = await _context.JobApplications
            .Where(ja => ja.UserId == userId && ja.Status == Core.Enums.JobApplicationStatus.Offer)
            .CountAsync();

        var companiesAppliedTo = await _context.JobApplications
            .Where(ja => ja.UserId == userId)
            .Select(ja => ja.CompanyId)
            .Distinct()
            .CountAsync();

        var userSkillsCount = await _context.Set<ApplicationUser>()
            .Where(u => u.Id == userId)
            .SelectMany(u => u.Skills)
            .CountAsync();

        var successRate = totalApplications > 0 
            ? (int)Math.Round((double)offersReceived / totalApplications * 100) 
            : 0;

        var stats = new
        {
            totalApplications,
            activeApplications,
            interviewsScheduled,
            offersReceived,
            averageResponseTime = 5, // Mock data for now
            successRate,
            companiesAppliedTo,
            skillsCount = userSkillsCount
        };

        return Ok(stats);
    }

    /// <summary>
    /// Get user's skills
    /// </summary>
    [HttpGet("skills")]
    public async Task<ActionResult<IEnumerable<object>>> GetUserSkills()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var userSkills = await _context.Set<ApplicationUser>()
            .Where(u => u.Id == userId)
            .SelectMany(u => u.Skills)
            .Select(s => new
            {
                id = s.Id,
                name = s.Name,
                category = "Technical" // Default category since Skill doesn't have category field
            })
            .ToListAsync();

        return Ok(userSkills);
    }

    /// <summary>
    /// Add skill to user profile
    /// </summary>
    [HttpPost("skills/{skillId}")]
    public async Task<IActionResult> AddSkill(int skillId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _context.Set<ApplicationUser>()
            .Include(u => u.Skills)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found");
        }

        var skill = await _context.Skills.FindAsync(skillId);
        if (skill == null)
        {
            return NotFound("Skill not found");
        }

        if (user.Skills.Any(s => s.Id == skillId))
        {
            return BadRequest("Skill already added to profile");
        }

        user.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Remove skill from user profile
    /// </summary>
    [HttpDelete("skills/{skillId}")]
    public async Task<IActionResult> RemoveSkill(int skillId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var user = await _context.Set<ApplicationUser>()
            .Include(u => u.Skills)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("User not found");
        }

        var skill = user.Skills.FirstOrDefault(s => s.Id == skillId);
        if (skill == null)
        {
            return NotFound("Skill not found in user profile");
        }

        user.Skills.Remove(skill);
        await _context.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Upload profile picture (placeholder - implement file storage as needed)
    /// </summary>
    [HttpPost("upload-picture")]
    public async Task<ActionResult<object>> UploadProfilePicture(IFormFile file)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
        if (!allowedTypes.Contains(file.ContentType))
        {
            return BadRequest("Only image files are allowed");
        }

        // Validate file size (5MB)
        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest("File size must not exceed 5MB");
        }

        // TODO: Implement actual file storage (Azure Blob, AWS S3, local storage, etc.)
        // For now, return a placeholder URL
        var placeholderUrl = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(file.FileName)}&size=150&background=667eea&color=fff";

        return Ok(new { url = placeholderUrl });
    }
}
