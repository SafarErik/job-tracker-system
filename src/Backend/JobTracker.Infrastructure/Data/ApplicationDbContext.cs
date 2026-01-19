namespace JobTracker.Infrastructure.Data;

using JobTracker.Core.Entities;
using Microsoft.EntityFrameworkCore;



public class ApplicationDbContext : DbContext
{

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
    public DbSet<Company> Companies {get; set;}

    public DbSet<Skill> Skills {get; set;}

    public DbSet<JobApplication> JobApplications {get; set;}


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure the JobApplication table's AppliedAt column
        // to automatically receive the current timestamp from the database
        modelBuilder.Entity<JobApplication>()
        .Property(j => j.AppliedAt)
        .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }


}