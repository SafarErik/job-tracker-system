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
                Industry = "AI / ML",
                TechStack = string.Join(";", new[] { "Python", "Go", "TensorFlow", "Kubernetes", "C++" }),
                Priority = "Tier1",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Peter Nagy", Role = "Senior Tech Recruiter", Email = "pnagy@google.com", LinkedIn = "https://linkedin.com/in/peternagy" },
                    new CompanyContact { Name = "Steve Johnson", Role = "Engineering Director", Email = "sjohnson@google.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "Microsoft Hungary",
                Website = "https://careers.microsoft.com",
                Industry = "Cloud Infrastructure",
                TechStack = string.Join(";", new[] { ".NET Core", "Azure", "React", "C#", "CosmosDB" }),
                Priority = "Tier1",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Anna Kovacs", Role = "Talent Acquisition Lead", Email = "akovacs@microsoft.com", LinkedIn = "https://linkedin.com/in/annakovacs" },
                    new CompanyContact { Name = "David Smith", Role = "Principal Dev Manager", Email = "dsmith@microsoft.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "EPAM Systems",
                Website = "https://www.epam.com/careers",
                Industry = "SaaS",
                TechStack = string.Join(";", new[] { "Java", "Spring Boot", "Angular", "AWS" }),
                Priority = "Tier2",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Gabor Szabo", Role = "Recruitment Specialist", Email = "g_szabo@epam.com" },
                    new CompanyContact { Name = "Maria Kiss", Role = "Delivery Manager", Email = "m_kiss@epam.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "Morgan Stanley Budapest",
                Website = "https://www.morganstanley.com/careers",
                Industry = "Fintech",
                TechStack = string.Join(";", new[] { "Java", "Scala", "C++", "Angular" }),
                Priority = "Tier1",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Eva Toth", Role = "HR Business Partner", Email = "eva.toth@morganstanley.com" },
                    new CompanyContact { Name = "Robert Black", Role = "VP of Engineering", Email = "r.black@morganstanley.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "Ericsson Hungary",
                Website = "https://www.ericsson.com/careers",
                Industry = "Telecommunications",
                TechStack = string.Join(";", new[] { "C++", "Erlang", "Python", "Cloud Native" }),
                Priority = "Tier2",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Janos Kiss", Role = "Talent Scout", Email = "janos.kiss@ericsson.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "Prezi",
                Website = "https://prezi.com/jobs",
                Industry = "SaaS",
                TechStack = string.Join(";", new[] { "JavaScript", "Scala", "Haskell", "React" }),
                Priority = "Tier2",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Zsofia Horvath", Role = "People Ops Lead", Email = "zsofi@prezi.com" },
                    new CompanyContact { Name = "Adam Wei", Role = "Frontend Lead", Email = "adam@prezi.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "LogMeIn (GoTo)",
                Website = "https://www.goto.com/company/careers",
                Industry = "SaaS",
                TechStack = string.Join(";", new[] { "Java", "Docker", "React", "AWS" }),
                Priority = "Tier3",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Balazs Molnar", Role = "Senior Recruiter", Email = "bmolnar@goto.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "Wise",
                Website = "https://wise.com/careers",
                Industry = "Fintech",
                TechStack = string.Join(";", new[] { "Java", "Spring Boot", "Kafka", "React" }),
                Priority = "Tier1",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Sarah Connor", Role = "Lead Recruiter", Email = "sarah.connor@wise.com", LinkedIn = "https://linkedin.com/in/sarahconnor" },
                    new CompanyContact { Name = "John Doe", Role = "Engineering Lead", Email = "john.doe@wise.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "SAP Hungary",
                Website = "https://jobs.sap.com",
                Industry = "SaaS",
                TechStack = string.Join(";", new[] { "Java", "Kubernetes", "Angular" }),
                Priority = "Tier2",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Laszlo Nemeth", Role = "HR Manager", Email = "l.nemeth@sap.com" }
                }
            },
            new Company
            {
                UserId = userId,
                Name = "Emarsys",
                Website = "https://emarsys.com/careers",
                Industry = "AdTech",
                TechStack = string.Join(";", new[] { "PHP", "Go", "React", "GCP" }),
                Priority = "Tier3",
                Contacts = new List<CompanyContact>
                {
                    new CompanyContact { Name = "Dora Farkas", Role = "Talent Acquisition", Email = "dora.farkas@emarsys.com" }
                }
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
            new Skill { Name = "C#", NormalizedName = "C#".ToUpperInvariant(), Category = CategoryProgrammingLanguage },
            new Skill { Name = "Python", NormalizedName = "PYTHON", Category = CategoryProgrammingLanguage },
            new Skill { Name = "JavaScript", NormalizedName = "JAVASCRIPT", Category = CategoryProgrammingLanguage },
            new Skill { Name = "TypeScript", NormalizedName = "TYPESCRIPT", Category = CategoryProgrammingLanguage },
            new Skill { Name = "Java", NormalizedName = "JAVA", Category = CategoryProgrammingLanguage },

            // Frameworks
            new Skill { Name = ".NET Core", NormalizedName = ".NET CORE", Category = CategoryFramework },
            new Skill { Name = "Angular", NormalizedName = "ANGULAR", Category = CategoryFramework },
            new Skill { Name = "React", NormalizedName = "REACT", Category = CategoryFramework },
            new Skill { Name = "Spring Boot", NormalizedName = "SPRING BOOT", Category = CategoryFramework },

            // Databases
            new Skill { Name = "SQL", NormalizedName = "SQL", Category = CategoryDatabase },
            new Skill { Name = "PostgreSQL", NormalizedName = "POSTGRESQL", Category = CategoryDatabase },
            new Skill { Name = "MongoDB", NormalizedName = "MONGODB", Category = CategoryDatabase },

            // DevOps
            new Skill { Name = "Docker", NormalizedName = "DOCKER", Category = CategoryDevOps },
            new Skill { Name = "Kubernetes", NormalizedName = "KUBERNETES", Category = CategoryDevOps },
            new Skill { Name = "Azure", NormalizedName = "AZURE", Category = CategoryCloud },
            new Skill { Name = "AWS", NormalizedName = "AWS", Category = CategoryCloud },
            new Skill { Name = "Git", NormalizedName = "GIT", Category = CategoryVersionControl },
            new Skill { Name = "CI/CD", NormalizedName = "CI/CD", Category = CategoryDevOps }
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

            // Randomly select new metadata
            var jobTypes = Enum.GetValues<JobType>();
            var workplaceTypes = Enum.GetValues<WorkplaceType>();
            var priorities = Enum.GetValues<JobPriority>();

            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                UserId = userId, // Link to the demo user
                Position = position,
                CompanyId = company.Id,
                JobUrl = $"https://jobs.example.com/{company.Name.Replace(" ", "-").ToLower()}/{i}",
                Description = $"Application for {position} position at {company.Name}. " +
                             $"This role offers exciting opportunities for career growth.",
                AppliedAt = DateTime.UtcNow.AddDays(-daysAgo),
                Status = status,
                JobType = jobTypes[random.Next(jobTypes.Length)],
                WorkplaceType = workplaceTypes[random.Next(workplaceTypes.Length)],
                Priority = priorities[random.Next(priorities.Length)],
                MatchScore = random.Next(40, 95), // Random but realistic scores
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
                        Id = Guid.NewGuid(),
                        Name = i.Name.Trim(),
                        NormalizedName = i.Name.Trim().ToUpperInvariant(),
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
