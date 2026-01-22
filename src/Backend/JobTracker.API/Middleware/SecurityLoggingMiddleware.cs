using System.Security.Claims;

namespace JobTracker.API.Middleware;

/// <summary>
/// Middleware for logging security-relevant events for audit trails and threat detection.
/// Logs authentication failures, authorization failures, and suspicious activity.
/// </summary>
public class SecurityLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SecurityLoggingMiddleware> _logger;

    public SecurityLoggingMiddleware(RequestDelegate next, ILogger<SecurityLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Anonymous";
        var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        var path = context.Request.Path;
        var method = context.Request.Method;

        try
        {
            await _next(context);

            // Log security-relevant status codes
            var statusCode = context.Response.StatusCode;
            
            switch (statusCode)
            {
                case 401: // Unauthorized
                    _logger.LogWarning(
                        "Authentication failed for user {UserId} from IP {IpAddress} on {Method} {Path}",
                        userId, ipAddress, method, path);
                    break;
                    
                case 403: // Forbidden
                    _logger.LogWarning(
                        "Authorization failed for user {UserId} from IP {IpAddress} on {Method} {Path}",
                        userId, ipAddress, method, path);
                    break;
                    
                case >= 400 and < 500: // Client errors
                    if (path.StartsWithSegments("/api/auth"))
                    {
                        _logger.LogWarning(
                            "Auth endpoint error {StatusCode} for user {UserId} from IP {IpAddress} on {Method} {Path}",
                            statusCode, userId, ipAddress, method, path);
                    }
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unhandled exception for user {UserId} from IP {IpAddress} on {Method} {Path}",
                userId, ipAddress, method, path);
            throw;
        }
        finally
        {
            var duration = DateTime.UtcNow - startTime;
            
            // Log slow requests (potential DoS indicators)
            if (duration.TotalSeconds > 5)
            {
                _logger.LogWarning(
                    "Slow request: {Method} {Path} took {Duration}ms for user {UserId} from IP {IpAddress}",
                    method, path, duration.TotalMilliseconds, userId, ipAddress);
            }
        }
    }
}

/// <summary>
/// Extension method for registering the security logging middleware.
/// </summary>
public static class SecurityLoggingMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SecurityLoggingMiddleware>();
    }
}
