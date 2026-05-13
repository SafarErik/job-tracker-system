using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using AspNetCoreRateLimit;
using JobTracker.Application.Interfaces;
using JobTracker.Application.Services;
using JobTracker.Core.Entities;
using JobTracker.Core.Interfaces;
using JobTracker.Infrastructure.Data;
using JobTracker.Infrastructure.Repositories;
using JobTracker.Infrastructure.Services;

namespace JobTracker.API.Extensions;

/// <summary>
/// Extension methods for registering application services, authentication,
/// and infrastructure concerns on <see cref="IServiceCollection"/>.
/// </summary>
public static class ServiceExtensions
{
    // ──────────────────────────────────────────────
    //  Repositories & Application Services
    // ──────────────────────────────────────────────

    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Repositories
        services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        services.AddScoped<ISkillRepository, SkillRepository>();
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        // Application & Infrastructure Services
        services.AddScoped<IDocumentTextExtractor, DocumentTextExtractor>();
        var geminiApiKey = configuration["AI:GeminiApiKey"];
        if (string.IsNullOrWhiteSpace(geminiApiKey))
        {
            services.AddScoped<IAIService, UnavailableAIService>();
        }
        else
        {
            services.AddScoped<IAIService, GeminiAIService>();
        }
        services.AddScoped<IJobApplicationService, JobApplicationService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICompanyIntelligenceService, CompanyIntelligenceService>();

        // Scraper Service with Typed HttpClient
        var scraperBaseUrl = configuration["ScraperService:BaseUrl"] ?? "http://localhost:8000";
        services.AddHttpClient<IScraperService, HttpScraperService>(client =>
        {
            client.BaseAddress = new Uri(scraperBaseUrl);
        });

        return services;
    }

    // ──────────────────────────────────────────────
    //  ASP.NET Core Identity
    // ──────────────────────────────────────────────

    public static IServiceCollection AddIdentityConfiguration(
        this IServiceCollection services, bool isDevelopment)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            // ... (Password settings remain)
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;

            // Lockout
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User
            options.User.RequireUniqueEmail = true;
            options.User.AllowedUserNameCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

            // Sign-in
            options.SignIn.RequireConfirmedEmail = !isDevelopment;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        return services;
    }

    // ──────────────────────────────────────────────
    //  JWT Authentication (+ optional Google OAuth)
    // ──────────────────────────────────────────────

    public static IServiceCollection AddJwtConfiguration(
        this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey is not configured!");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

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

        // Google OAuth – only if credentials are configured
        var googleClientId = configuration["Authentication:Google:ClientId"];
        var googleClientSecret = configuration["Authentication:Google:ClientSecret"];

        if (!string.IsNullOrEmpty(googleClientId) && !string.IsNullOrEmpty(googleClientSecret))
        {
            services.AddAuthentication()
                .AddGoogle(options =>
                {
                    options.ClientId = googleClientId;
                    options.ClientSecret = googleClientSecret;
                    options.CorrelationCookie.SameSite = SameSiteMode.None;
                    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.Always;
                });
            Console.WriteLine("✅ Google OAuth enabled");
        }
        else
        {
            Console.WriteLine("⚠️ Google OAuth not configured – skipping.");
        }

        return services;
    }

    // ──────────────────────────────────────────────
    //  Swagger / OpenAPI
    // ──────────────────────────────────────────────

    public static IServiceCollection AddSwaggerConfiguration(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
            {
                Title = "JobTracker API",
                Version = "v1",
                Description = "API for tracking job applications with user authentication"
            });

            options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = Microsoft.OpenApi.SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = Microsoft.OpenApi.ParameterLocation.Header,
                Description = "Enter your JWT token. Example: eyJhbGciOiJIUzI1..."
            });

            options.AddSecurityRequirement(_ =>
            {
                var requirement = new Microsoft.OpenApi.OpenApiSecurityRequirement();
                var schemeRef = new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer");
                requirement.Add(schemeRef, new List<string>());
                return requirement;
            });
        });

        return services;
    }

    // ──────────────────────────────────────────────
    //  CORS
    // ──────────────────────────────────────────────

    public static IServiceCollection AddCorsConfiguration(
        this IServiceCollection services, IConfiguration configuration, bool isDevelopment)
    {
        var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>();
        if (allowedOrigins == null || allowedOrigins.Length == 0)
        {
            allowedOrigins = ["http://localhost:4200"];
        }

        services.AddCors(options =>
        {
            options.AddPolicy("AllowAngular", policy =>
            {
                policy.SetIsOriginAllowed(origin =>
                {
                    if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
                        return true;

                    if (isDevelopment && origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase))
                        return true;

                    return false;
                })
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
            });
        });

        return services;
    }

    // ──────────────────────────────────────────────
    //  Rate Limiting (AspNetCoreRateLimit)
    // ──────────────────────────────────────────────

    public static IServiceCollection AddRateLimiting(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMemoryCache();
        services.Configure<IpRateLimitOptions>(options =>
        {
            options.EnableEndpointRateLimiting = true;
            options.StackBlockedRequests = false;
            options.RealIpHeader = "X-Real-IP";
            options.ClientIdHeader = "X-ClientId";
            options.HttpStatusCode = 429;

            options.GeneralRules =
            [
                new RateLimitRule { Endpoint = "*", Period = "1m", Limit = 100 },
                new RateLimitRule { Endpoint = "*/auth/login", Period = "1m", Limit = 5 },
                new RateLimitRule { Endpoint = "*/auth/register", Period = "1h", Limit = 3 },
                new RateLimitRule { Endpoint = "*/documents/upload", Period = "1m", Limit = 10 }
            ];
        });

        // Use Redis if configured (Production), otherwise Memory Cache (Development)
        var redisConnectionString = configuration.GetConnectionString("Redis");

        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnectionString;
                options.InstanceName = "JobTracker_";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddSingleton<IIpPolicyStore, DistributedCacheIpPolicyStore>();
        services.AddSingleton<IRateLimitCounterStore, DistributedCacheRateLimitCounterStore>();
        services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
        services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

        return services;
    }

    // ──────────────────────────────────────────────
    //  FluentValidation
    // ──────────────────────────────────────────────

    public static IServiceCollection AddValidationConfiguration(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<JobTracker.Application.DTOs.Auth.RegisterDto>();
        services.AddFluentValidationAutoValidation();
        return services;
    }
}
