using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.Endpoints;
using MyTravel.Server.Services;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=app.db"));

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager<CustomSignInManager>();

builder.Services.AddSingleton<IEmailSender<ApplicationUser>, EmailSender>();

// In-memory tracking for active users (stores userId -> lastActivity)
builder.Services.AddSingleton<ConcurrentDictionary<string, DateTime>>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    // Seed database with sample data
    await DbSeeder.SeedAsync(app.Services);
}

// Map Identity API endpoints
app.MapGroup("/api").MapIdentityApi<ApplicationUser>();

// Map custom endpoints
app.MapUserEndpoints();
app.MapAdminEndpoints();
app.MapActivityEndpoints();
app.MapBookingEndpoints();
app.MapAdminBookingEndpoints();
app.MapBlogEndpoints();
app.MapAdminBlogEndpoints();
app.MapWeatherEndpoints();

app.UseDefaultFiles();
app.MapStaticAssets();

app.MapFallbackToFile("/index.html");

app.Run();
