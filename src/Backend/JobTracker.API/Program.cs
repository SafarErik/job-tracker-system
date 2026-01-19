using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;
using JobTracker.Infrastructure.Repositories;
using JobTracker.Core.Interfaces;


var builder = WebApplication.CreateBuilder(args);

// Read the coonection string from the appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// We register The DBContext to the postgresql here
builder.Services.AddDbContext<JobTracker.Infrastructure.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// We register the repositories here
builder.Services.AddScoped<IJobApplicationRepository, JobApplicationRepository>();
builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
builder.Services.AddControllers();

// Add services to the container.
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowAngular"); // Now The frontend can request data from the backend!
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
