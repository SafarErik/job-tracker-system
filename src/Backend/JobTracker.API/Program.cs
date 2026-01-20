using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;
using JobTracker.Infrastructure.Repositories;
using JobTracker.Core.Interfaces;
using JobTracker.API.Extensions;


var builder = WebApplication.CreateBuilder(args);

// Read the connection string from appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Register DbContext with PostgreSQL
builder.Services.AddDbContext<JobTracker.Infrastructure.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register repositories
builder.Services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<ISkillRepository, SkillRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddControllers();

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
   options.AddPolicy("AllowAngular", policy =>
   {
      policy.WithOrigins("http://localhost:4200") // Angular app URL
              .AllowAnyMethod() // GET, POST, PUT, DELETE
              .AllowAnyHeader(); 
   });
});

var app = builder.Build();

// Database management - ONLY in Development environment!
var resetDb = args.Contains("--reset-db");

if (resetDb && !app.Environment.IsDevelopment())
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("❌ ERROR: --reset-db flag can ONLY be used in Development environment!");
    Console.WriteLine("❌ Deleting production database is FORBIDDEN!");
    Console.ResetColor();
    Environment.Exit(1); // Stop the application
}

if (app.Environment.IsDevelopment())
{
    if (resetDb)
    {
        // Complete database reset
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("⚠️  WARNING: Database deletion in 3 seconds...");
        Console.ResetColor();
        await Task.Delay(3000); // 3 seconds to cancel
        
        await app.ResetDatabaseAsync();
    }
    else
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Create database if it doesn't exist
        await context.Database.EnsureCreatedAsync();
    }
    
    // Seed initial data
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await DataSeeder.SeedAsync(context);
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowAngular"); // Enable CORS for frontend
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
