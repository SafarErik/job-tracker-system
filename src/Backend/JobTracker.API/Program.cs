using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using JobTracker.Infrastructure.Data;
using JobTracker.Infrastructure.Repositories;
using JobTracker.Core.Interfaces;
using JobTracker.Core.Entities;
using JobTracker.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// DATABASE CONFIGURATION
// ============================================

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Register DbContext with PostgreSQL and Identity support
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// ============================================
// ASP.NET CORE IDENTITY CONFIGURATION
// ============================================

// AddIdentity registers all Identity services including:
// - UserManager<ApplicationUser> - for managing users (create, delete, update)
// - SignInManager<ApplicationUser> - for handling sign-in logic
// - RoleManager<IdentityRole> - for managing roles (if using role-based auth)
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password requirements - configure based on your security needs
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;

    // Lockout settings - protect against brute force attacks
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = 
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

    // Sign-in settings
    options.SignIn.RequireConfirmedEmail = false; // Set to true in production!
})
.AddEntityFrameworkStores<ApplicationDbContext>() // Use EF Core for storing Identity data
.AddDefaultTokenProviders(); // Provides tokens for password reset, email confirmation, etc.

// ============================================
// JWT AUTHENTICATION CONFIGURATION
// ============================================

// Get JWT settings from configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] 
    ?? throw new InvalidOperationException("JWT SecretKey is not configured!");

builder.Services.AddAuthentication(options =>
{
    // Set JWT Bearer as the default authentication scheme
    // This means all [Authorize] endpoints will expect a JWT token
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Token validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Validate the signing key
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),

        // Validate the issuer (who created the token)
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],

        // Validate the audience (who the token is intended for)
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],

        // Validate the token's lifetime
        ValidateLifetime = true,

        // Allow for some clock skew between servers
        ClockSkew = TimeSpan.Zero
    };

    // Optional: Events for debugging and customization
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
            {
                context.Response.Headers.Append("Token-Expired", "true");
            }
            return Task.CompletedTask;
        }
    };
});

// ============================================
// GOOGLE OAUTH (Optional - only if configured)
// ============================================
// Google OAuth is only registered if ClientId is configured.
// To enable: Add your Google OAuth credentials to appsettings.json or user secrets.
// Get credentials from: https://console.cloud.google.com/apis/credentials

var googleClientId = builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];

if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
{
    builder.Services.AddAuthentication()
        .AddGoogle(options =>
        {
            options.ClientId = googleClientId;
            options.ClientSecret = googleClientSecret;
        });
    Console.WriteLine("✅ Google OAuth enabled");
}
else
{
    Console.WriteLine("⚠️ Google OAuth not configured - skipping. Set Authentication:Google:ClientId and ClientSecret to enable.");
}

// ============================================
// REPOSITORY REGISTRATION (Dependency Injection)
// ============================================

builder.Services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddScoped<ISkillRepository, SkillRepository>();
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();

// ============================================
// HTTP CLIENT FACTORY REGISTRATION
// ============================================

// Register IHttpClientFactory for making HTTP requests
// This is a best practice for connection reuse and proper lifetime management
builder.Services.AddHttpClient();

// ============================================
// API CONFIGURATION
// ============================================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT authentication support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "JobTracker API",
        Version = "v1",
        Description = "API for tracking job applications with user authentication"
    });

    // Add JWT authentication to Swagger UI
    // Users can click "Authorize" button and enter their JWT token
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Description = "Enter your JWT token. Example: eyJhbGciOiJIUzI1..."
    });

    // Apply the Bearer security scheme globally to all endpoints in Swagger
    // This means the "Authorize" token will be sent with every request
    // In .NET 10, AddSecurityRequirement uses a function that takes the document
    options.AddSecurityRequirement(_ =>
    {
        var requirement = new Microsoft.OpenApi.OpenApiSecurityRequirement();
        var schemeRef = new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer");
        requirement.Add(schemeRef, new List<string>());
        return requirement;
    });
});

// Configure CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Important for authentication cookies
    });
});

var app = builder.Build();

// ============================================
// DATABASE INITIALIZATION (Development Only)
// ============================================

var resetDb = args.Contains("--reset-db");

if (resetDb && !app.Environment.IsDevelopment())
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("❌ ERROR: --reset-db flag can ONLY be used in Development environment!");
    Console.WriteLine("❌ Deleting production database is FORBIDDEN!");
    Console.ResetColor();
    Environment.Exit(1);
}

if (app.Environment.IsDevelopment())
{
    if (resetDb)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine("⚠️  WARNING: Database deletion in 3 seconds...");
        Console.ResetColor();
        await Task.Delay(3000);
        
        await app.ResetDatabaseAsync();
    }
    else
    {
        using var scope = app.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();
    }
    
    // Seed initial data with demo user
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        await DataSeeder.SeedAsync(context, userManager);
    }
}

// ============================================
// HTTP REQUEST PIPELINE
// ============================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come before authentication
app.UseCors("AllowAngular");

// Authentication & Authorization middleware
// IMPORTANT: Order matters! Authentication must come before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
