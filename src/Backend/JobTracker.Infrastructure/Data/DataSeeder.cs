using System.Text.Json;
using JobTracker.Core.Entities;
using JobTracker.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Infrastructure.Data;

/// <summary>
/// Seeds initial data into the database for development and testing purposes.
/// Creates a demo user with companies, skills, and job applications.
/// 
/// IMPORTANT: This should only run in Development environment!
/// Production data should never be seeded automatically.
/// </summary>
public static class DataSeeder
{
    // Demo user credentials for testing
    public const string DemoUserEmail = "demo@jobtracker.com";
    public const string DemoUserPassword = "Demo123!";

    // Skill category constants to avoid magic strings
    private const string CategoryProgrammingLanguage = "Programming Language";
    private const string CategoryFramework = "Framework";
    private const string CategoryDatabase = "Database";
    private const string CategoryDevOps = "DevOps";
    private const string CategoryCloud = "Cloud";
    private const string CategoryVersionControl = "Version Control";

    /// <summary>
    /// Seeds all development data including a demo user.
    /// Requires UserManager to be passed for creating the demo user.
    /// </summary>
    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        // Always ensure base skills exist, even if other data already present
        await SeedSkillsIfEmpty(context);

        // Skip the demo dataset if companies already exist
        if (context.Companies.Any())
        {
            Console.WriteLine("Database already contains data. Demo seeding skipped.");
            return;
        }

        Console.WriteLine("🌱 Starting database seeding...");

        // ============================================
        // 1. CREATE DEMO USER
        // ============================================
        var demoUser = await CreateDemoUserAsync(userManager);

        // ============================================
        // 2. CREATE COMPANIES
        // ============================================
        var companies = CreateCompanies(demoUser.Id);
        await context.Companies.AddRangeAsync(companies);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ 10 companies created");

        // ============================================
        // 3. CREATE SKILLS (already seeded above) - load current list
        // ============================================
        var skills = context.Skills.ToList();

        // Assign some skills to the demo user
        demoUser.Skills = skills.Take(5).ToList(); // User knows first 5 skills
        await userManager.UpdateAsync(demoUser);
        Console.WriteLine("✅ Demo user skills assigned");

        // ============================================
        // 4. CREATE JOB APPLICATIONS
        // ============================================
        var applications = CreateJobApplications(companies, skills, demoUser.Id);
        await context.JobApplications.AddRangeAsync(applications);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ 15 job applications created");

        Console.WriteLine("🎉 Database seeding completed!");
        Console.WriteLine($"📧 Demo user: {DemoUserEmail}");
        Console.WriteLine($"🔑 Password: {DemoUserPassword}");
    }

    /// <summary>
    /// Creates a demo user for development testing
    /// </summary>
    private static async Task<ApplicationUser> CreateDemoUserAsync(
        UserManager<ApplicationUser> userManager)
    {
        // Check if demo user already exists
        var existingUser = await userManager.FindByEmailAsync(DemoUserEmail);
        if (existingUser != null)
        {
            Console.WriteLine("✅ Demo user already exists");
            return existingUser;
        }

        var demoUser = new ApplicationUser
        {
            UserName = DemoUserEmail,
            Email = DemoUserEmail,
            EmailConfirmed = true, // Skip email confirmation for demo
            FirstName = "Demo",
            LastName = "User",
            CurrentJobTitle = "Software Developer",
            YearsOfExperience = 3,
            Bio = "A passionate developer looking for new opportunities.",
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(demoUser, DemoUserPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create demo user: {errors}");
        }

        Console.WriteLine("✅ Demo user created");
        return demoUser;
    }

    /// <summary>
    /// Creates sample companies for job applications
    /// </summary>
    private static List<Company> CreateCompanies(string userId)
    {
        return new List<Company>
        {
            new Company
            {
                UserId = userId,
                Name = "Google Hungary",
                Website = "https://careers.google.com",
                HRContactName = "Peter Nagy"
            },
            new Company
            {
                UserId = userId,
                Name = "Microsoft Hungary",
                Website = "https://careers.microsoft.com",
                HRContactName = "Anna Kovacs"
            },
            new Company
            {
                UserId = userId,
                Name = "EPAM Systems",
                Website = "https://www.epam.com/careers",
                HRContactName = "Gabor Szabo"
            },
            new Company
            {
                UserId = userId,
                Name = "Morgan Stanley Budapest",
                Website = "https://www.morganstanley.com/careers",
                HRContactName = "Eva Toth"
            },
            new Company
            {
                UserId = userId,
                Name = "Ericsson Hungary",
                Website = "https://www.ericsson.com/careers",
                HRContactName = "Janos Kiss"
            },
            new Company
            {
                UserId = userId,
                Name = "Prezi",
                Website = "https://prezi.com/jobs",
                HRContactName = "Zsofia Horvath"
            },
            new Company
            {
                UserId = userId,
                Name = "LogMeIn (GoTo)",
                Website = "https://www.goto.com/company/careers",
                HRContactName = "Balazs Molnar"
            },
            new Company
            {
                UserId = userId,
                Name = "NNG (Sygic)",
                Website = "https://www.nng.com/careers",
                HRContactName = "Katalin Varga"
            },
            new Company
            {
                UserId = userId,
                Name = "SAP Hungary",
                Website = "https://jobs.sap.com",
                HRContactName = "Laszlo Nemeth"
            },
            new Company
            {
                UserId = userId,
                Name = "Bitrise",
                Website = "https://www.bitrise.io/careers",
                HRContactName = "Dora Farkas"
            }
        };
    }

    /// <summary>
    /// Creates skills with categories for better organization
    /// </summary>
    private static List<Skill> CreateSkills()
    {
        return new List<Skill>
        {
            // Programming Languages
            new Skill { Name = "C#", Category = CategoryProgrammingLanguage },
            new Skill { Name = "Python", Category = CategoryProgrammingLanguage },
            new Skill { Name = "JavaScript", Category = CategoryProgrammingLanguage },
            new Skill { Name = "TypeScript", Category = CategoryProgrammingLanguage },
            new Skill { Name = "Java", Category = CategoryProgrammingLanguage },

            // Frameworks
            new Skill { Name = ".NET Core", Category = CategoryFramework },
            new Skill { Name = "Angular", Category = CategoryFramework },
            new Skill { Name = "React", Category = CategoryFramework },
            new Skill { Name = "Spring Boot", Category = CategoryFramework },

            // Databases
            new Skill { Name = "SQL", Category = CategoryDatabase },
            new Skill { Name = "PostgreSQL", Category = CategoryDatabase },
            new Skill { Name = "MongoDB", Category = CategoryDatabase },

            // DevOps
            new Skill { Name = "Docker", Category = CategoryDevOps },
            new Skill { Name = "Kubernetes", Category = CategoryDevOps },
            new Skill { Name = "Azure", Category = CategoryCloud },
            new Skill { Name = "AWS", Category = CategoryCloud },
            new Skill { Name = "Git", Category = CategoryVersionControl },
            new Skill { Name = "CI/CD", Category = CategoryDevOps }
        };
    }

    /// <summary>
    /// Creates sample job applications for the demo user
    /// </summary>
    private static List<JobApplication> CreateJobApplications(
        List<Company> companies,
        List<Skill> skills,
        string userId)
    {
        var positions = new[]
        {
            "Junior Backend Developer",
            "Full-stack Developer",
            "Frontend Developer",
            "Senior .NET Developer",
            "DevOps Engineer",
            "Software Engineer",
            "Cloud Architect",
            "Mobile Developer",
            "Data Engineer",
            "QA Automation Engineer"
        };

        var statuses = Enum.GetValues<JobApplicationStatus>();
        var random = new Random(42); // Fixed seed for reproducible results

        var applications = new List<JobApplication>();

        for (int i = 0; i < 15; i++)
        {
            var company = companies[random.Next(companies.Count)];
            var position = positions[random.Next(positions.Length)];
            var status = statuses[random.Next(statuses.Length)];
            var daysAgo = random.Next(1, 60);

            var application = new JobApplication
            {
                UserId = userId, // Link to the demo user
                Position = position,
                CompanyId = company.Id,
                JobUrl = $"https://jobs.example.com/{company.Name.Replace(" ", "-").ToLower()}/{i}",
                Description = $"Application for {position} position at {company.Name}. " +
                             $"This role offers exciting opportunities for career growth.",
                AppliedAt = DateTime.UtcNow.AddDays(-daysAgo),
                Status = status,
                SalaryOffer = status == JobApplicationStatus.Offer 
                    ? random.Next(600000, 1200000) 
                    : null
            };

            // Add random skills (2-4 per application)
            var skillCount = random.Next(2, 5);
            var selectedSkills = skills.OrderBy(x => random.Next()).Take(skillCount).ToList();
            application.Skills = selectedSkills;

            applications.Add(application);
        }

        return applications;
    }

    /// <summary>
    /// Seeds the Skills table from a JSON file if empty.
    /// </summary>
    private static async Task SeedSkillsIfEmpty(ApplicationDbContext context)
    {
        if (context.Skills.Any())
        {
            Console.WriteLine("Skills already exist. Seeding skipped.");
            return;
        }

        var skills = await LoadSkillsFromJsonAsync();
        if (skills.Count == 0)
        {
            skills = CreateSkills();
            Console.WriteLine("skills.json not found or empty, using built-in fallback list.");
        }

        await context.Skills.AddRangeAsync(skills);
        await context.SaveChangesAsync();
        Console.WriteLine($"✅ Skills seeded ({skills.Count})");
    }

    /// <summary>
    /// Loads skills from skills.json (copied to output). If not found or invalid, returns empty list.
    /// </summary>
    private static async Task<List<Skill>> LoadSkillsFromJsonAsync()
    {
        var candidatePaths = new List<string>
        {
            Path.Combine(AppContext.BaseDirectory, "skills.json"),
            Path.Combine(AppContext.BaseDirectory, "Data", "skills.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "skills.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "Data", "skills.json")
        };

        foreach (var path in candidatePaths)
        {
            if (!File.Exists(path)) continue;

            try
            {
                var json = await File.ReadAllTextAsync(path);
                var items = JsonSerializer.Deserialize<List<SkillSeedDto>>(json, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }) ?? new List<SkillSeedDto>();

                var skills = items
                    .Where(i => !string.IsNullOrWhiteSpace(i.Name))
                    .Select(i => new Skill
                    {
                        Name = i.Name.Trim(),
                        Category = string.IsNullOrWhiteSpace(i.Category) ? null : i.Category.Trim()
                    })
                    .ToList();

                if (skills.Count > 0)
                {
                    Console.WriteLine($"Loaded {skills.Count} skills from {path}");
                    return skills;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to load skills from {path}: {ex.Message}");
            }
        }

        return new List<Skill>();
    }

    private record SkillSeedDto(string Name, string? Category);
}
