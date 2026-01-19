using JobTracker.Core.Entities;
using JobTracker.Core.Enums;

namespace JobTracker.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Skip seeding if data already exists
        if (context.Companies.Any())
        {
            Console.WriteLine("Database already contains data. Seeding skipped.");
            return;
        }

        Console.WriteLine("🌱 Starting database seeding...");

        // 1. Create companies
        var companies = new List<Company>
        {
            new Company
            {
                Name = "Google Hungary",
                Website = "https://careers.google.com",
                ContactPerson = "Peter Nagy"
            },
            new Company
            {
                Name = "Microsoft Hungary",
                Website = "https://careers.microsoft.com",
                ContactPerson = "Anna Kovacs"
            },
            new Company
            {
                Name = "EPAM Systems",
                Website = "https://www.epam.com/careers",
                ContactPerson = "Gabor Szabo"
            },
            new Company
            {
                Name = "Morgan Stanley Budapest",
                Website = "https://www.morganstanley.com/careers",
                ContactPerson = "Eva Toth"
            },
            new Company
            {
                Name = "Ericsson Hungary",
                Website = "https://www.ericsson.com/careers",
                ContactPerson = "Janos Kiss"
            },
            new Company
            {
                Name = "Prezi",
                Website = "https://prezi.com/jobs",
                ContactPerson = "Zsofia Horvath"
            },
            new Company
            {
                Name = "LogMeIn (GoTo)",
                Website = "https://www.goto.com/company/careers",
                ContactPerson = "Balazs Molnar"
            },
            new Company
            {
                Name = "NNG (Sygic)",
                Website = "https://www.nng.com/careers",
                ContactPerson = "Katalin Varga"
            },
            new Company
            {
                Name = "SAP Hungary",
                Website = "https://jobs.sap.com",
                ContactPerson = "Laszlo Nemeth"
            },
            new Company
            {
                Name = "Bitrise",
                Website = "https://www.bitrise.io/careers",
                ContactPerson = "Dora Farkas"
            }
        };

        await context.Companies.AddRangeAsync(companies);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ 10 companies created");

        // 2. Create skills
        var skills = new List<Skill>
        {
            new Skill { Name = "C#" },
            new Skill { Name = ".NET Core" },
            new Skill { Name = "Angular" },
            new Skill { Name = "React" },
            new Skill { Name = "TypeScript" },
            new Skill { Name = "SQL" },
            new Skill { Name = "Docker" },
            new Skill { Name = "Kubernetes" },
            new Skill { Name = "Azure" },
            new Skill { Name = "Git" }
        };

        await context.Skills.AddRangeAsync(skills);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ 10 skills created");

        // 3. Create job applications
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
        var random = new Random();

        var applications = new List<JobApplication>();
        for (int i = 0; i < 15; i++)
        {
            var company = companies[random.Next(companies.Count)];
            var position = positions[random.Next(positions.Length)];
            var status = statuses[random.Next(statuses.Length)];
            var daysAgo = random.Next(1, 60);

            var application = new JobApplication
            {
                Position = position,
                CompanyId = company.Id,
                JobUrl = $"https://jobs.example.com/{company.Name.Replace(" ", "-").ToLower()}/{i}",
                Description = $"Application for {position} position at {company.Name}. " +
                             $"This role offers exciting opportunities for career growth.",
                AppliedAt = DateTime.UtcNow.AddDays(-daysAgo),
                Status = status,
                SalaryOffer = status == JobApplicationStatus.Offer ? random.Next(600000, 1200000) : null
            };

            // Add random skills (2-4 per application)
            var skillCount = random.Next(2, 5);
            var selectedSkills = skills.OrderBy(x => random.Next()).Take(skillCount).ToList();
            application.Skills = selectedSkills;

            applications.Add(application);
        }

        await context.JobApplications.AddRangeAsync(applications);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ 15 job applications created");

        Console.WriteLine("🎉 Database seeding completed!");
    }
}
