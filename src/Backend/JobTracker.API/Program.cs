using Microsoft.EntityFrameworkCore;
using JobTracker.Infrastructure.Data;


var builder = WebApplication.CreateBuilder(args);

// Read the coonection string from the appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// We register The DBContext to the postgresql here
builder.Services.AddDbContext<JobTracker.Infrastructure.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));


// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();
