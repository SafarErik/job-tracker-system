using Microsoft.AspNetCore.Identity;
using JobTracker.Infrastructure.Data;
using JobTracker.Core.Entities;
using JobTracker.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// ── Service Registration ─────────────────────
builder.Services.AddDatabaseContext(builder.Configuration);
builder.Services.AddIdentityConfiguration(builder.Environment.IsDevelopment());
builder.Services.AddJwtConfiguration(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddHttpClient();
builder.Services.AddRateLimiting(builder.Configuration);
builder.Services.AddValidationConfiguration();

// Application Insights (production only)
if (!builder.Environment.IsDevelopment())
{
    builder.Services.AddApplicationInsightsTelemetry();
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.Create(
            System.Text.Unicode.UnicodeRanges.BasicLatin,
            System.Text.Unicode.UnicodeRanges.Latin1Supplement,
            System.Text.Unicode.UnicodeRanges.LatinExtendedA,
            System.Text.Unicode.UnicodeRanges.LatinExtendedB);
    });

builder.Services.AddSwaggerConfiguration();
builder.Services.AddCorsConfiguration(builder.Configuration, builder.Environment.IsDevelopment());

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
                             | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto
                             | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedHost;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database");

var app = builder.Build();

// ── Database Initialization (Development) ────
var resetDb = args.Contains("--reset-db");

if (resetDb && !app.Environment.IsDevelopment())
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("ERROR: --reset-db flag can ONLY be used in Development environment!");
    Console.ResetColor();
    Environment.Exit(1);
}

if (app.Environment.IsDevelopment())
{
    if (resetDb)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("WARNING: Database deletion in 3 seconds...");
        Console.ResetColor();
        await Task.Delay(3000);
        await app.ResetDatabaseAsync();
    }

    await app.ApplyMigrationsAsync();

    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    await DataSeeder.SeedAsync(context, userManager);
}

// ── HTTP Request Pipeline ────────────────────
app.UseRequestPipeline();

await app.RunAsync();
