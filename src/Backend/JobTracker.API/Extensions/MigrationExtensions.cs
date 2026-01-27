using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.API.Extensions;

public static class MigrationExtensions
{
    public static async Task ApplyMigrationsAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Log that we are checking for migrations
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Checking for and applying pending database migrations...");

        try 
        {
            await context.Database.MigrateAsync();
            logger.LogInformation("✅ Database migrations applied successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "❌ An error occurred while applying database migrations.");
            throw; // Re-throw to stop application startup if migration fails
        }
    }
}
