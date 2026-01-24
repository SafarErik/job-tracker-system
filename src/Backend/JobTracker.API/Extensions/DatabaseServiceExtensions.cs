using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;

namespace JobTracker.API.Extensions;

/// <summary>
/// Extension methods for configuring database services.
/// Supports multiple database providers (PostgreSQL for development, SQL Server for production).
/// </summary>
public static class DatabaseServiceExtensions
{
    /// <summary>
    /// Supported database providers for the application.
    /// </summary>
    public enum DatabaseProvider
    {
        /// <summary>
        /// PostgreSQL - Used for local development with Docker.
        /// Free, open-source, and feature-rich.
        /// </summary>
        PostgreSQL,
        
        /// <summary>
        /// SQL Server - Used for Azure production deployment.
        /// More cost-effective on Azure with better integration.
        /// </summary>
        SqlServer
    }

    /// <summary>
    /// Adds and configures the database context based on the configured provider.
    /// 
    /// Configuration priority:
    /// 1. "DatabaseProvider" setting in appsettings.json
    /// 2. Falls back to PostgreSQL if not specified (development default)
    /// 
    /// Usage in appsettings.json:
    /// {
    ///   "DatabaseProvider": "PostgreSQL",  // or "SqlServer"
    ///   "ConnectionStrings": {
    ///     "DefaultConnection": "your-connection-string"
    ///   }
    /// }
    /// </summary>
    /// <param name="services">The service collection to add the DbContext to.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The service collection for chaining.</returns>
    /// <exception cref="InvalidOperationException">Thrown when connection string is not configured.</exception>
    /// <exception cref="ArgumentException">Thrown when an unsupported database provider is specified.</exception>
    public static IServiceCollection AddDatabaseContext(
        this IServiceCollection services, 
        IConfiguration configuration)
    {
        // Get connection string - required for database operations
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' is not configured. " +
                "Please set it in appsettings.json or environment variables.");

        // Determine which database provider to use
        // Default to PostgreSQL for backward compatibility with existing development setup
        var providerName = configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";
        
        if (!Enum.TryParse<DatabaseProvider>(providerName, ignoreCase: true, out var provider))
        {
            throw new ArgumentException(
                $"Unsupported database provider: '{providerName}'. " +
                $"Supported providers: {string.Join(", ", Enum.GetNames<DatabaseProvider>())}");
        }

        // Configure DbContext based on the selected provider
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            ConfigureProvider(options, provider, connectionString);
        });

        // Log which provider is being used (helpful for debugging)
        Console.WriteLine($"📊 Database Provider: {provider}");

        return services;
    }

    /// <summary>
    /// Configures the DbContext options for the specified database provider.
    /// </summary>
    private static void ConfigureProvider(
        DbContextOptionsBuilder options, 
        DatabaseProvider provider, 
        string connectionString)
    {
        switch (provider)
        {
            case DatabaseProvider.PostgreSQL:
                // PostgreSQL configuration for local development
                // Using Npgsql provider with reasonable timeout
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.CommandTimeout(30);
                    // Enable retry on failure for transient errors
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });
                break;

            case DatabaseProvider.SqlServer:
                // SQL Server configuration for Azure production
                // Using Microsoft.Data.SqlClient with Azure-optimized settings
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.CommandTimeout(30);
                    // Enable retry on failure - essential for Azure SQL
                    // Azure SQL can have transient connection issues
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorNumbersToAdd: null);
                });
                break;

            default:
                throw new ArgumentException($"Provider {provider} is not implemented.");
        }
    }
}
