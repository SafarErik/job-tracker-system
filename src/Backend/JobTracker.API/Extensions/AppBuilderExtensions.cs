using AspNetCoreRateLimit;
using JobTracker.API.Middleware;

namespace JobTracker.API.Extensions;

/// <summary>
/// Extension methods for the <see cref="WebApplication"/> middleware pipeline configuration.
/// </summary>
public static class AppBuilderExtensions
{
    /// <summary>
    /// Adds production security headers (HSTS, XSS, CSP, etc.) to all responses.
    /// Only applied in non-Development environments.
    /// </summary>
    public static WebApplication UseSecurityHeaders(this WebApplication app)
    {
        if (app.Environment.IsDevelopment()) return app;

        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Frame-Options", "DENY");
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
            context.Response.Headers.Append("Strict-Transport-Security",
                "max-age=31536000; includeSubDomains");
            context.Response.Headers.Append("Content-Security-Policy",
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                "font-src 'self' https://fonts.gstatic.com data:; " +
                "img-src 'self' data: https: blob:; " +
                "connect-src 'self' https://jobtracker-api.azurewebsites.net https://jobtracker-frontend.azurewebsites.net; " +
                "frame-ancestors 'none'");
            await next();
        });

        return app;
    }

    /// <summary>
    /// Conditionally enables Swagger UI in Development environments.
    /// </summary>
    public static WebApplication UseSwaggerMiddleware(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        return app;
    }

    /// <summary>
    /// Configures the full HTTP request pipeline in the correct order.
    /// </summary>
    public static WebApplication UseRequestPipeline(this WebApplication app)
    {
        app.UseForwardedHeaders();
        app.UseGlobalExceptionHandlerMiddleware();

        app.UseSwaggerMiddleware();
        app.UseSecurityHeaders();

        app.UseHttpsRedirection();
        app.UseIpRateLimiting();
        app.UseCors("AllowAngular");

        app.UseAuthentication();
        app.UseSecurityLogging();
        app.UseAuthorization();

        app.MapHealthChecks("/health");
        app.MapControllers();

        return app;
    }
}
