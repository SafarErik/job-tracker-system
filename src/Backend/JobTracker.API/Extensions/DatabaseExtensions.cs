using JobTracker.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.API.Extensions;

public static class DatabaseExtensions
{
    public static async Task ResetDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        Console.WriteLine("🗑️  Adatbázis törlése...");
        await context.Database.EnsureDeletedAsync();
        
        Console.WriteLine("🔨 Adatbázis újra létrehozása...");
        await context.Database.EnsureCreatedAsync();
        
        Console.WriteLine("✅ Adatbázis sikeresen törölve és újra létrehozva!");
    }
}
