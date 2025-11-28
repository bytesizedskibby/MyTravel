using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.Services;
using System.Collections.Concurrent;
using System.Security.Claims;
using System.Text.RegularExpressions;

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

app.MapGroup("/api").MapIdentityApi<ApplicationUser>();

app.MapGet("/api/user", (System.Security.Claims.ClaimsPrincipal user) =>
{
    return user.Identity?.IsAuthenticated == true 
        ? Results.Ok(new { user.Identity.Name, IsAuthenticated = true }) 
        : Results.Unauthorized();
});

// Get current user's full profile
app.MapGet("/api/user/profile", async (
    ClaimsPrincipal user,
    ApplicationDbContext db) =>
{
    if (user.Identity?.IsAuthenticated != true)
    {
        return Results.Unauthorized();
    }

    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
    {
        return Results.Unauthorized();
    }

    var appUser = await db.Users.FindAsync(userId);
    if (appUser == null)
    {
        return Results.NotFound();
    }

    return Results.Ok(new UserProfileDto(
        appUser.Id,
        appUser.Email,
        appUser.FirstName,
        appUser.LastName,
        appUser.FullName
    ));
});

// Update current user's profile
app.MapPut("/api/user/profile", async (
    UpdateProfileRequest request,
    ClaimsPrincipal user,
    ApplicationDbContext db) =>
{
    if (user.Identity?.IsAuthenticated != true)
    {
        return Results.Unauthorized();
    }

    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
    {
        return Results.Unauthorized();
    }

    var appUser = await db.Users.FindAsync(userId);
    if (appUser == null)
    {
        return Results.NotFound();
    }

    if (!string.IsNullOrWhiteSpace(request.FirstName))
    {
        appUser.FirstName = request.FirstName;
    }
    if (!string.IsNullOrWhiteSpace(request.LastName))
    {
        appUser.LastName = request.LastName;
    }

    await db.SaveChangesAsync();

    return Results.Ok(new UserProfileDto(
        appUser.Id,
        appUser.Email,
        appUser.FirstName,
        appUser.LastName,
        appUser.FullName
    ));
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

// ========== BOOKING ENDPOINTS ==========

// Create a new booking (supports guest checkout)
app.MapPost("/api/bookings", async (
    CreateBookingRequest request,
    ApplicationDbContext db,
    ClaimsPrincipal user,
    IEmailSender<ApplicationUser> emailSender) =>
{
    if (request.Items == null || request.Items.Count == 0)
    {
        return Results.BadRequest(new { message = "At least one booking item is required" });
    }

    string? userId = null;
    string customerEmail;
    string customerName;

    // If authenticated, use user profile data
    if (user.Identity?.IsAuthenticated == true)
    {
        userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var appUser = await db.Users.FindAsync(userId);
        if (appUser != null)
        {
            customerEmail = appUser.Email ?? request.CustomerEmail ?? "";
            customerName = !string.IsNullOrWhiteSpace(appUser.FullName) 
                ? appUser.FullName 
                : request.CustomerName ?? "";
        }
        else
        {
            customerEmail = request.CustomerEmail ?? "";
            customerName = request.CustomerName ?? "";
        }
    }
    else
    {
        // Guest checkout - require email and name
        if (string.IsNullOrWhiteSpace(request.CustomerEmail) || string.IsNullOrWhiteSpace(request.CustomerName))
        {
            return Results.BadRequest(new { message = "Customer email and name are required for guest checkout" });
        }
        customerEmail = request.CustomerEmail;
        customerName = request.CustomerName;
    }

    var booking = new Booking
    {
        UserId = userId,
        CustomerEmail = customerEmail,
        CustomerName = customerName,
        TotalAmount = request.Items.Sum(i => i.Price),
        Status = BookingStatus.Confirmed,
        ConfirmedAt = DateTime.UtcNow,
        PaymentReference = request.PaymentReference
    };

    foreach (var item in request.Items)
    {
        booking.Items.Add(new BookingItem
        {
            Type = Enum.Parse<BookingItemType>(item.Type, true),
            Title = item.Title,
            Details = item.Details,
            Price = item.Price,
            ImageUrl = item.ImageUrl
        });
    }

    db.Bookings.Add(booking);
    await db.SaveChangesAsync();

    // Send confirmation email
    try
    {
        var itemsList = string.Join("\n", booking.Items.Select(i => $"- {i.Title}: ${i.Price:F2}"));
        var emailBody = $@"
Dear {booking.CustomerName},

Thank you for your booking with MyTravel!

Booking Reference: #{booking.Id}
Total Amount: ${booking.TotalAmount:F2}

Items:
{itemsList}

Your booking has been confirmed. We look forward to serving you!

Best regards,
The MyTravel Team
";
        await emailSender.SendConfirmationLinkAsync(
            new ApplicationUser { Email = booking.CustomerEmail, UserName = booking.CustomerName },
            booking.CustomerEmail,
            emailBody);
    }
    catch
    {
        // Email sending failed, but booking was created successfully
    }

    return Results.Created($"/api/bookings/{booking.Id}", new
    {
        id = booking.Id,
        message = "Booking created successfully",
        totalAmount = booking.TotalAmount,
        status = booking.Status.ToString()
    });
});

// Get current user's bookings
app.MapGet("/api/bookings", async (
    ApplicationDbContext db,
    ClaimsPrincipal user) =>
{
    if (user.Identity?.IsAuthenticated != true)
    {
        return Results.Ok(new { bookings = Array.Empty<object>() });
    }

    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
    {
        return Results.Ok(new { bookings = Array.Empty<object>() });
    }

    var bookings = await db.Bookings
        .Where(b => b.UserId == userId)
        .OrderByDescending(b => b.CreatedAt)
        .Select(b => new BookingDto(
            b.Id,
            b.CustomerEmail,
            b.CustomerName,
            b.TotalAmount,
            b.Status.ToString(),
            b.CreatedAt,
            b.ConfirmedAt,
            b.CancelledAt,
            b.PaymentReference,
            b.Items.Select(i => new BookingItemDto(
                i.Id,
                i.Type.ToString(),
                i.Title,
                i.Details,
                i.Price,
                i.ImageUrl
            )).ToList()
        ))
        .ToListAsync();

    return Results.Ok(new { bookings });
});

// Get booking by ID
app.MapGet("/api/bookings/{id:int}", async (
    int id,
    ApplicationDbContext db,
    ClaimsPrincipal user) =>
{
    var booking = await db.Bookings
        .Include(b => b.Items)
        .FirstOrDefaultAsync(b => b.Id == id);

    if (booking == null)
    {
        return Results.NotFound(new { message = "Booking not found" });
    }

    // Only allow access to own bookings for non-admin users
    if (user.Identity?.IsAuthenticated == true)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (booking.UserId != null && booking.UserId != userId)
        {
            return Results.Forbid();
        }
    }

    return Results.Ok(new BookingDto(
        booking.Id,
        booking.CustomerEmail,
        booking.CustomerName,
        booking.TotalAmount,
        booking.Status.ToString(),
        booking.CreatedAt,
        booking.ConfirmedAt,
        booking.CancelledAt,
        booking.PaymentReference,
        booking.Items.Select(i => new BookingItemDto(
            i.Id,
            i.Type.ToString(),
            i.Title,
            i.Details,
            i.Price,
            i.ImageUrl
        )).ToList()
    ));
});

// ========== ADMIN BOOKING ENDPOINTS ==========

// Get all bookings (admin)
app.MapGet("/api/admin/bookings", async (
    ApplicationDbContext db,
    HttpContext httpContext,
    int page = 1,
    int pageSize = 10,
    string? search = null,
    string? status = null,
    string sortBy = "createdAt",
    string sortOrder = "desc") =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var query = db.Bookings.Include(b => b.Items).AsQueryable();

    // Apply search filter
    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(b =>
            b.CustomerEmail.Contains(search) ||
            b.CustomerName.Contains(search) ||
            b.Id.ToString() == search);
    }

    // Apply status filter
    if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<BookingStatus>(status, true, out var statusEnum))
    {
        query = query.Where(b => b.Status == statusEnum);
    }

    // Apply sorting
    query = sortBy.ToLower() switch
    {
        "customername" => sortOrder == "asc" ? query.OrderBy(b => b.CustomerName) : query.OrderByDescending(b => b.CustomerName),
        "customeremail" => sortOrder == "asc" ? query.OrderBy(b => b.CustomerEmail) : query.OrderByDescending(b => b.CustomerEmail),
        "totalamount" => sortOrder == "asc" ? query.OrderBy(b => b.TotalAmount) : query.OrderByDescending(b => b.TotalAmount),
        "status" => sortOrder == "asc" ? query.OrderBy(b => b.Status) : query.OrderByDescending(b => b.Status),
        _ => sortOrder == "asc" ? query.OrderBy(b => b.CreatedAt) : query.OrderByDescending(b => b.CreatedAt)
    };

    var totalCount = await query.CountAsync();
    var bookings = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(b => new BookingDto(
            b.Id,
            b.CustomerEmail,
            b.CustomerName,
            b.TotalAmount,
            b.Status.ToString(),
            b.CreatedAt,
            b.ConfirmedAt,
            b.CancelledAt,
            b.PaymentReference,
            b.Items.Select(i => new BookingItemDto(
                i.Id,
                i.Type.ToString(),
                i.Title,
                i.Details,
                i.Price,
                i.ImageUrl
            )).ToList()
        ))
        .ToListAsync();

    return Results.Ok(new
    {
        bookings,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
    });
});

// Get booking by ID (admin)
app.MapGet("/api/admin/bookings/{id:int}", async (
    int id,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var booking = await db.Bookings
        .Include(b => b.Items)
        .FirstOrDefaultAsync(b => b.Id == id);

    if (booking == null)
    {
        return Results.NotFound(new { message = "Booking not found" });
    }

    return Results.Ok(new BookingDto(
        booking.Id,
        booking.CustomerEmail,
        booking.CustomerName,
        booking.TotalAmount,
        booking.Status.ToString(),
        booking.CreatedAt,
        booking.ConfirmedAt,
        booking.CancelledAt,
        booking.PaymentReference,
        booking.Items.Select(i => new BookingItemDto(
            i.Id,
            i.Type.ToString(),
            i.Title,
            i.Details,
            i.Price,
            i.ImageUrl
        )).ToList()
    ));
});

// Update booking status (admin)
app.MapPatch("/api/admin/bookings/{id:int}/status", async (
    int id,
    UpdateBookingStatusRequest request,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var booking = await db.Bookings.FindAsync(id);
    if (booking == null)
    {
        return Results.NotFound(new { message = "Booking not found" });
    }

    if (!Enum.TryParse<BookingStatus>(request.Status, true, out var newStatus))
    {
        return Results.BadRequest(new { message = "Invalid status value" });
    }

    booking.Status = newStatus;

    // Update timestamps based on status
    if (newStatus == BookingStatus.Confirmed && booking.ConfirmedAt == null)
    {
        booking.ConfirmedAt = DateTime.UtcNow;
    }
    else if (newStatus == BookingStatus.Cancelled && booking.CancelledAt == null)
    {
        booking.CancelledAt = DateTime.UtcNow;
    }

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Booking status updated successfully",
        id = booking.Id,
        status = booking.Status.ToString()
    });
});

// Get booking statistics (admin)
app.MapGet("/api/admin/bookings/stats", async (
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var totalBookings = await db.Bookings.CountAsync();
    var pendingBookings = await db.Bookings.CountAsync(b => b.Status == BookingStatus.Pending);
    var confirmedBookings = await db.Bookings.CountAsync(b => b.Status == BookingStatus.Confirmed);
    var cancelledBookings = await db.Bookings.CountAsync(b => b.Status == BookingStatus.Cancelled);
    var completedBookings = await db.Bookings.CountAsync(b => b.Status == BookingStatus.Completed);
    
    var totalRevenue = await db.Bookings
        .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed)
        .SumAsync(b => b.TotalAmount);
    
    var bookingsToday = await db.Bookings.CountAsync(b => b.CreatedAt.Date == DateTime.UtcNow.Date);
    var bookingsThisWeek = await db.Bookings.CountAsync(b => b.CreatedAt >= DateTime.UtcNow.AddDays(-7));
    var bookingsThisMonth = await db.Bookings.CountAsync(b => b.CreatedAt >= DateTime.UtcNow.AddDays(-30));

    return Results.Ok(new
    {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue,
        bookingsToday,
        bookingsThisWeek,
        bookingsThisMonth
    });
});

// ========== BLOG ENDPOINTS ==========

// Helper function to generate URL-safe slugs
static string GenerateSlug(string title)
{
    if (string.IsNullOrWhiteSpace(title)) return string.Empty;
    
    var slug = title.ToLowerInvariant();
    slug = Regex.Replace(slug, @"[^a-z0-9\s-]", ""); // Remove special characters
    slug = Regex.Replace(slug, @"\s+", "-"); // Replace spaces with hyphens
    slug = Regex.Replace(slug, @"-+", "-"); // Replace multiple hyphens with single
    slug = slug.Trim('-');
    return slug;
}

// Get all published blog posts (public)
app.MapGet("/api/blog", async (
    ApplicationDbContext db,
    int page = 1,
    int pageSize = 10,
    string? category = null) =>
{
    var query = db.BlogPosts
        .Include(p => p.Author)
        .Where(p => p.Published)
        .AsQueryable();

    if (!string.IsNullOrWhiteSpace(category))
    {
        query = query.Where(p => p.Category == category);
    }

    var totalCount = await query.CountAsync();
    var posts = await query
        .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new BlogPostDto(
            p.Id,
            p.Title,
            p.Slug,
            p.Category,
            p.Excerpt,
            p.Content,
            p.ImageUrl,
            p.Published,
            p.CreatedAt,
            p.UpdatedAt,
            p.PublishedAt,
            p.Author != null ? new BlogAuthorDto(p.Author.Id, p.Author.FullName) : null
        ))
        .ToListAsync();

    return Results.Ok(new
    {
        posts,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
    });
});

// Get blog post by slug (public)
app.MapGet("/api/blog/{slug}", async (
    string slug,
    ApplicationDbContext db) =>
{
    var post = await db.BlogPosts
        .Include(p => p.Author)
        .FirstOrDefaultAsync(p => p.Slug == slug && p.Published);

    if (post == null)
    {
        return Results.NotFound(new { message = "Blog post not found" });
    }

    return Results.Ok(new BlogPostDto(
        post.Id,
        post.Title,
        post.Slug,
        post.Category,
        post.Excerpt,
        post.Content,
        post.ImageUrl,
        post.Published,
        post.CreatedAt,
        post.UpdatedAt,
        post.PublishedAt,
        post.Author != null ? new BlogAuthorDto(post.Author.Id, post.Author.FullName) : null
    ));
});

// Get all blog posts (admin)
app.MapGet("/api/admin/blog", async (
    ApplicationDbContext db,
    HttpContext httpContext,
    int page = 1,
    int pageSize = 10,
    string? search = null,
    string? category = null,
    string? status = null,
    string sortBy = "createdAt",
    string sortOrder = "desc") =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var query = db.BlogPosts.Include(p => p.Author).AsQueryable();

    // Apply search filter
    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(p =>
            p.Title.Contains(search) ||
            p.Excerpt.Contains(search));
    }

    // Apply category filter
    if (!string.IsNullOrWhiteSpace(category))
    {
        query = query.Where(p => p.Category == category);
    }

    // Apply status filter
    if (!string.IsNullOrWhiteSpace(status))
    {
        var isPublished = status.ToLower() == "published";
        query = query.Where(p => p.Published == isPublished);
    }

    // Apply sorting
    query = sortBy.ToLower() switch
    {
        "title" => sortOrder == "asc" ? query.OrderBy(p => p.Title) : query.OrderByDescending(p => p.Title),
        "category" => sortOrder == "asc" ? query.OrderBy(p => p.Category) : query.OrderByDescending(p => p.Category),
        "published" => sortOrder == "asc" ? query.OrderBy(p => p.Published) : query.OrderByDescending(p => p.Published),
        "publishedat" => sortOrder == "asc" ? query.OrderBy(p => p.PublishedAt) : query.OrderByDescending(p => p.PublishedAt),
        _ => sortOrder == "asc" ? query.OrderBy(p => p.CreatedAt) : query.OrderByDescending(p => p.CreatedAt)
    };

    var totalCount = await query.CountAsync();
    var posts = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new BlogPostDto(
            p.Id,
            p.Title,
            p.Slug,
            p.Category,
            p.Excerpt,
            p.Content,
            p.ImageUrl,
            p.Published,
            p.CreatedAt,
            p.UpdatedAt,
            p.PublishedAt,
            p.Author != null ? new BlogAuthorDto(p.Author.Id, p.Author.FullName) : null
        ))
        .ToListAsync();

    return Results.Ok(new
    {
        posts,
        totalCount,
        page,
        pageSize,
        totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
    });
});

// Get blog post by ID (admin)
app.MapGet("/api/admin/blog/{id:int}", async (
    int id,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var post = await db.BlogPosts
        .Include(p => p.Author)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (post == null)
    {
        return Results.NotFound(new { message = "Blog post not found" });
    }

    return Results.Ok(new BlogPostDto(
        post.Id,
        post.Title,
        post.Slug,
        post.Category,
        post.Excerpt,
        post.Content,
        post.ImageUrl,
        post.Published,
        post.CreatedAt,
        post.UpdatedAt,
        post.PublishedAt,
        post.Author != null ? new BlogAuthorDto(post.Author.Id, post.Author.FullName) : null
    ));
});

// Create blog post (admin)
app.MapPost("/api/admin/blog", async (
    CreateBlogPostRequest request,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    if (string.IsNullOrWhiteSpace(request.Title))
    {
        return Results.BadRequest(new { message = "Title is required" });
    }

    var slug = GenerateSlug(request.Title);
    
    // Ensure unique slug
    var existingSlug = await db.BlogPosts.AnyAsync(p => p.Slug == slug);
    if (existingSlug)
    {
        slug = $"{slug}-{DateTime.UtcNow.Ticks}";
    }

    var post = new BlogPost
    {
        AuthorId = request.AuthorId,
        Title = request.Title,
        Slug = slug,
        Category = request.Category ?? "solo-travel",
        Excerpt = request.Excerpt ?? string.Empty,
        Content = request.Content,
        ImageUrl = request.ImageUrl,
        Published = request.Published,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow,
        PublishedAt = request.Published ? DateTime.UtcNow : null
    };

    db.BlogPosts.Add(post);
    await db.SaveChangesAsync();

    return Results.Created($"/api/admin/blog/{post.Id}", new
    {
        id = post.Id,
        slug = post.Slug,
        message = "Blog post created successfully"
    });
});

// Update blog post (admin)
app.MapPut("/api/admin/blog/{id:int}", async (
    int id,
    UpdateBlogPostRequest request,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var post = await db.BlogPosts.FindAsync(id);
    if (post == null)
    {
        return Results.NotFound(new { message = "Blog post not found" });
    }

    if (!string.IsNullOrWhiteSpace(request.Title) && request.Title != post.Title)
    {
        post.Title = request.Title;
        var newSlug = GenerateSlug(request.Title);
        var existingSlug = await db.BlogPosts.AnyAsync(p => p.Slug == newSlug && p.Id != id);
        post.Slug = existingSlug ? $"{newSlug}-{DateTime.UtcNow.Ticks}" : newSlug;
    }

    if (request.Category != null)
    {
        post.Category = request.Category;
    }

    if (request.Excerpt != null)
    {
        post.Excerpt = request.Excerpt;
    }

    if (request.Content != null)
    {
        post.Content = request.Content;
    }

    if (request.ImageUrl != null)
    {
        post.ImageUrl = request.ImageUrl;
    }

    if (request.Published.HasValue)
    {
        var wasPublished = post.Published;
        post.Published = request.Published.Value;
        
        // Set PublishedAt when first published
        if (!wasPublished && post.Published)
        {
            post.PublishedAt = DateTime.UtcNow;
        }
    }

    post.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Blog post updated successfully",
        id = post.Id,
        slug = post.Slug
    });
});

// Delete blog post (admin)
app.MapDelete("/api/admin/blog/{id:int}", async (
    int id,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var post = await db.BlogPosts.FindAsync(id);
    if (post == null)
    {
        return Results.NotFound(new { message = "Blog post not found" });
    }

    db.BlogPosts.Remove(post);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Blog post deleted successfully" });
});

// Toggle blog post published status (admin)
app.MapPatch("/api/admin/blog/{id:int}/toggle-publish", async (
    int id,
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var post = await db.BlogPosts.FindAsync(id);
    if (post == null)
    {
        return Results.NotFound(new { message = "Blog post not found" });
    }

    post.Published = !post.Published;
    post.UpdatedAt = DateTime.UtcNow;
    
    if (post.Published && post.PublishedAt == null)
    {
        post.PublishedAt = DateTime.UtcNow;
    }

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = $"Blog post {(post.Published ? "published" : "unpublished")} successfully",
        published = post.Published
    });
});

// Get blog statistics (admin)
app.MapGet("/api/admin/blog/stats", async (
    ApplicationDbContext db,
    HttpContext httpContext) =>
{
    var adminCookie = httpContext.Request.Cookies["admin_session"];
    if (adminCookie != "authenticated")
    {
        return Results.Unauthorized();
    }

    var totalPosts = await db.BlogPosts.CountAsync();
    var publishedPosts = await db.BlogPosts.CountAsync(p => p.Published);
    var draftPosts = await db.BlogPosts.CountAsync(p => !p.Published);
    
    var postsThisWeek = await db.BlogPosts.CountAsync(p => p.CreatedAt >= DateTime.UtcNow.AddDays(-7));
    var postsThisMonth = await db.BlogPosts.CountAsync(p => p.CreatedAt >= DateTime.UtcNow.AddDays(-30));
    
    var postsByCategory = await db.BlogPosts
        .GroupBy(p => p.Category)
        .Select(g => new { category = g.Key, count = g.Count() })
        .ToListAsync();

    return Results.Ok(new
    {
        totalPosts,
        publishedPosts,
        draftPosts,
        postsThisWeek,
        postsThisMonth,
        postsByCategory
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

// Booking DTOs
internal record CreateBookingRequest(
    string? CustomerEmail,
    string? CustomerName,
    string? PaymentReference,
    List<CreateBookingItemRequest> Items
);

internal record CreateBookingItemRequest(
    string Type,
    string Title,
    string Details,
    decimal Price,
    string? ImageUrl
);

internal record BookingDto(
    int Id,
    string CustomerEmail,
    string CustomerName,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? CancelledAt,
    string? PaymentReference,
    List<BookingItemDto> Items
);

internal record BookingItemDto(
    int Id,
    string Type,
    string Title,
    string Details,
    decimal Price,
    string? ImageUrl
);

internal record UpdateBookingStatusRequest(string Status);

// User Profile DTOs
internal record UserProfileDto(
    string Id,
    string? Email,
    string? FirstName,
    string? LastName,
    string FullName
);

internal record UpdateProfileRequest(
    string? FirstName,
    string? LastName
);

// Blog DTOs
internal record BlogAuthorDto(
    string Id,
    string Name
);

internal record BlogPostDto(
    int Id,
    string Title,
    string Slug,
    string Category,
    string Excerpt,
    string? Content,
    string? ImageUrl,
    bool Published,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? PublishedAt,
    BlogAuthorDto? Author
);

internal record CreateBlogPostRequest(
    string Title,
    string? Category,
    string? Excerpt,
    string? Content,
    string? ImageUrl,
    string? AuthorId,
    bool Published
);

internal record UpdateBlogPostRequest(
    string? Title,
    string? Category,
    string? Excerpt,
    string? Content,
    string? ImageUrl,
    bool? Published
);
