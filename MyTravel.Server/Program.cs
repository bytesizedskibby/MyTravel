using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
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
    
    // Create DB if not exists
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.EnsureCreated();
    }
}

app.MapGroup("/api").MapIdentityApi<ApplicationUser>();

app.MapGet("/api/user", (System.Security.Claims.ClaimsPrincipal user) =>
{
    return user.Identity?.IsAuthenticated == true 
        ? Results.Ok(new { user.Identity.Name, IsAuthenticated = true }) 
        : Results.Unauthorized();
});

app.MapPost("/api/logout", async (Microsoft.AspNetCore.Identity.SignInManager<ApplicationUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    return Results.Ok();
});

// Admin endpoints
app.MapPost("/api/admin/login", async (
    AdminLoginRequest request,
    IConfiguration config,
    HttpContext httpContext) =>
{
    var adminEmail = config["AdminCredentials:Email"];
    var adminPassword = config["AdminCredentials:Password"];

    if (request.Email == adminEmail && request.Password == adminPassword)
    {
        // Store admin session in a cookie
        httpContext.Response.Cookies.Append("admin_session", "authenticated", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddHours(8)
        });

        return Results.Ok(new { message = "Admin login successful", isAdmin = true });
    }

    return Results.Unauthorized();
});

app.MapPost("/api/admin/logout", (HttpContext httpContext) =>
{
    httpContext.Response.Cookies.Delete("admin_session");
    return Results.Ok(new { message = "Admin logged out" });
});

app.MapGet("/api/admin/verify", (HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie == "authenticated")
    {
        return Results.Ok(new { isAdmin = true });
    }
    return Results.Unauthorized();
});

app.MapGet("/api/admin/users", async (
    ApplicationDbContext db,
    HttpContext httpContext,
    int page = 1,
    int pageSize = 10,
    string? search = null,
    string sortBy = "createdAt",
    string sortOrder = "desc") =>
{
    // Verify admin session
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var query = db.Users.AsQueryable();

    // Apply search filter
    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(u => 
            (u.UserName != null && u.UserName.Contains(search)) || 
            (u.Email != null && u.Email.Contains(search)));
    }

    // Apply sorting
    query = sortBy.ToLower() switch
    {
        "username" => sortOrder == "asc" ? query.OrderBy(u => u.UserName) : query.OrderByDescending(u => u.UserName),
        "email" => sortOrder == "asc" ? query.OrderBy(u => u.Email) : query.OrderByDescending(u => u.Email),
        "lastloginat" => sortOrder == "asc" ? query.OrderBy(u => u.LastLoginAt) : query.OrderByDescending(u => u.LastLoginAt),
        _ => sortOrder == "asc" ? query.OrderBy(u => u.CreatedAt) : query.OrderByDescending(u => u.CreatedAt)
    };

    var totalCount = await query.CountAsync();
    var users = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(u => new UserDto(
            u.Id,
            u.UserName,
            u.Email,
            u.CreatedAt,
            u.LastLoginAt,
            u.IsActive,
            u.EmailConfirmed
        ))
        .ToListAsync();

    return Results.Ok(new
    {
        users,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
    });
});

app.MapGet("/api/admin/stats", async (
    ApplicationDbContext db,
    HttpContext httpContext,
    ConcurrentDictionary<string, DateTime> activeUsers) =>
{
    // Verify admin session
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var totalUsers = await db.Users.CountAsync();
    var activeUsersCount = await db.Users.CountAsync(u => u.IsActive);
    var newUsersToday = await db.Users.CountAsync(u => u.CreatedAt.Date == DateTime.UtcNow.Date);
    var newUsersThisWeek = await db.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-7));
    var newUsersThisMonth = await db.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30));

    // Clean up stale entries (inactive for more than 5 minutes)
    var staleThreshold = DateTime.UtcNow.AddMinutes(-5);
    var staleKeys = activeUsers.Where(kv => kv.Value < staleThreshold).Select(kv => kv.Key).ToList();
    foreach (var key in staleKeys)
    {
        activeUsers.TryRemove(key, out _);
    }

    var currentlyOnline = activeUsers.Count;

    return Results.Ok(new
    {
        totalUsers,
        activeUsersCount,
        currentlyOnline,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
    });
});

// Track user activity (call this from authenticated endpoints)
app.MapPost("/api/heartbeat", (
    System.Security.Claims.ClaimsPrincipal user,
    ConcurrentDictionary<string, DateTime> activeUsers) =>
{
    if (user.Identity?.IsAuthenticated == true)
    {
        var userId = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            activeUsers[userId] = DateTime.UtcNow;
        }
    }
    return Results.Ok();
});

// Simple ping endpoint to track online users (works for all visitors)
app.MapGet("/api/ping", (
    HttpContext httpContext,
    ConcurrentDictionary<string, DateTime> activeUsers) =>
{
    // Use session cookie or create a visitor ID
    var visitorId = httpContext.Request.Cookies["visitor_id"];
    if (string.IsNullOrEmpty(visitorId))
    {
        visitorId = Guid.NewGuid().ToString();
        httpContext.Response.Cookies.Append("visitor_id", visitorId, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(1)
        });
    }
    
    activeUsers[visitorId] = DateTime.UtcNow;
    return Results.Ok(new { status = "ok" });
});

// Get single user details
app.MapGet("/api/admin/users/{id}", async (
    string id,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.NotFound(new { message = "User not found" });
    }

    return Results.Ok(new UserDto(
        user.Id,
        user.UserName,
        user.Email,
        user.CreatedAt,
        user.LastLoginAt,
        user.IsActive,
        user.EmailConfirmed
    ));
});

// Toggle user active status
app.MapPatch("/api/admin/users/{id}/toggle-status", async (
    string id,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.NotFound(new { message = "User not found" });
    }

    user.IsActive = !user.IsActive;
    await db.SaveChangesAsync();

    return Results.Ok(new { 
        message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully",
        isActive = user.IsActive
    });
});

// Delete user
app.MapDelete("/api/admin/users/{id}", async (
    string id,
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.NotFound(new { message = "User not found" });
    }

    var result = await userManager.DeleteAsync(user);
    if (!result.Succeeded)
    {
        return Results.BadRequest(new { message = "Failed to delete user", errors = result.Errors });
    }

    return Results.Ok(new { message = "User deleted successfully" });
});

// Update user details
app.MapPut("/api/admin/users/{id}", async (
    string id,
    UpdateUserRequest request,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var user = await db.Users.FindAsync(id);
    if (user == null)
    {
        return Results.NotFound(new { message = "User not found" });
    }

    if (!string.IsNullOrWhiteSpace(request.UserName))
    {
        user.UserName = request.UserName;
        user.NormalizedUserName = request.UserName.ToUpperInvariant();
    }

    if (request.IsActive.HasValue)
    {
        user.IsActive = request.IsActive.Value;
    }

    if (request.EmailConfirmed.HasValue)
    {
        user.EmailConfirmed = request.EmailConfirmed.Value;
    }

    await db.SaveChangesAsync();

    return Results.Ok(new { 
        message = "User updated successfully",
        user = new UserDto(
            user.Id,
            user.UserName,
            user.Email,
            user.CreatedAt,
            user.LastLoginAt,
            user.IsActive,
            user.EmailConfirmed
        )
    });
});

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapFallbackToFile("/index.html");

app.Run();

// DTOs
internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

internal record AdminLoginRequest(string Email, string Password);

internal record UserDto(
    string Id,
    string? UserName,
    string? Email,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    bool IsActive,
    bool EmailConfirmed
);

internal record UpdateUserRequest(
    string? UserName,
    bool? IsActive,
    bool? EmailConfirmed
);
