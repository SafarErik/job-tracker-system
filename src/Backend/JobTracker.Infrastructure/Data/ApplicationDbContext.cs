using JobTracker.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace JobTracker.Infrastructure.Data;

/// <summary>
/// The main database context for the JobTracker application.
/// Inherits from IdentityDbContext to include all Identity-related tables
/// (Users, Roles, UserRoles, UserClaims, UserLogins, RoleClaims, UserTokens).
/// 
/// The generic parameter <ApplicationUser> tells Identity to use our custom user class.
/// </summary>
public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // ============================================
    // DBSETS - Define tables in the database
    // ============================================

    /// <summary>
    /// Note: Users DbSet is inherited from IdentityDbContext
    /// It's accessible via this.Users
    /// </summary>

    public DbSet<Company> Companies { get; set; }

    public DbSet<Skill> Skills { get; set; }

    public DbSet<JobApplication> JobApplications { get; set; }

    public DbSet<Document> Documents { get; set; }

    // ============================================
    // MODEL CONFIGURATION
    // ============================================

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // IMPORTANT: Call base method first!
        // This configures all Identity-related tables and relationships
        base.OnModelCreating(modelBuilder);

        // ============================================
        // IDENTITY TABLE CUSTOMIZATION (Optional)
        // ============================================
        // Rename Identity tables to use "Auth" prefix for clarity
        // This is optional but makes the schema more organized

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("Users");
        });

        // ============================================
        // JOB APPLICATION CONFIGURATION
        // ============================================

        modelBuilder.Entity<JobApplication>(entity =>
        {
            // Configure AppliedAt to use database timestamp
            entity.Property(j => j.AppliedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Configure relationship with User (many applications per user)
            // Restrict deletes to avoid SQL Server cascade path conflicts
            entity.HasOne(j => j.User)
                .WithMany(u => u.JobApplications)
                .HasForeignKey(j => j.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Company (many applications per company)
            // Restrict deletes to avoid SQL Server cascade path conflicts
            entity.HasOne(j => j.Company)
                .WithMany(c => c.JobApplications)
                .HasForeignKey(j => j.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Document
            entity.HasOne(j => j.Document)
                .WithMany(d => d.JobApplications)
                .HasForeignKey(j => j.DocumentId)
                .OnDelete(DeleteBehavior.SetNull); // Keep application if document is deleted
        });

        // ============================================
        // DOCUMENT CONFIGURATION
        // ============================================

        modelBuilder.Entity<Document>(entity =>
        {
            // Configure relationship with User
            entity.HasOne(d => d.User)
                .WithMany(u => u.Documents)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Delete documents when user is deleted
        });

        // ============================================
        // SKILL CONFIGURATION (MANY-TO-MANY)
        // ============================================

        // EF Core 5+ handles many-to-many relationships automatically
        // by creating a join table. We can customize it if needed.

        // Skill <-> JobApplication (skills required for jobs)
        modelBuilder.Entity<Skill>()
            .HasMany(s => s.JobApplications)
            .WithMany(j => j.Skills)
            .UsingEntity(j => j.ToTable("JobApplicationSkills"));

        // Skill <-> User (skills the user has)
        modelBuilder.Entity<Skill>()
            .HasMany(s => s.Users)
            .WithMany(u => u.Skills)
            .UsingEntity(j => j.ToTable("UserSkills"));

        // ============================================
        // INDEXES FOR PERFORMANCE
        // ============================================

        // Index on Skill name for faster lookups during NLP matching
        modelBuilder.Entity<Skill>()
            .HasIndex(s => s.Name)
            .IsUnique();
    }
}