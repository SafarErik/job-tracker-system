using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.API.Extensions;

public static class DatabaseExtensions
{
    public static async Task ResetDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        Console.WriteLine("Deleting database...");
        await context.Database.EnsureDeletedAsync();
        Console.WriteLine("Database deleted!");

        Console.WriteLine("Recreating database...");
        await context.Database.MigrateAsync();

        Console.WriteLine("Database successfully reset!");
    }
}
