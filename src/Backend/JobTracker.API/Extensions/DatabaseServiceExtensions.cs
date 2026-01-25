using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;

namespace JobTracker.API.Extensions;

/// <summary>
/// Extension methods for configuring database services.
/// Uses SQL Server for both development (Docker) and production (Azure).
/// </summary>
public static class DatabaseServiceExtensions
{
    /// <summary>
    /// Adds and configures the database context with SQL Server.
    /// 
    /// Configuration in appsettings.json:
    /// {
    ///   "ConnectionStrings": {
    ///     "DefaultConnection": "your-connection-string"
    ///   }
    /// }
    /// </summary>
    /// <param name="services">The service collection to add the DbContext to.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    /// <exception cref="InvalidOperationException">Thrown when connection string is not configured.</exception>
    public static IServiceCollection AddDatabaseContext(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured. " +
                "Please set it in appsettings.json or environment variables.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.CommandTimeout(30);
                // Enable retry on failure
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorCodesToAdd: null);
            });
        });

        Console.WriteLine("📊 Database Provider: PostgreSQL (Neon)");

        return services;
    }
}
