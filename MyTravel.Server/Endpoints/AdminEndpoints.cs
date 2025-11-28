using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.DTOs;
using System.Collections.Concurrent;

namespace MyTravel.Server.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/login", async (
            AdminLoginRequest request,
            IConfiguration config,
            HttpContext httpContext) =>
        {
            var adminEmail = config["AdminCredentials:Email"];
            var adminPassword = config["AdminCredentials:Password"];

            if (request.Email == adminEmail && request.Password == adminPassword)
            {
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
            var adminCookie = httpContext.Request.Cookies["admin_session"];
            if (adminCookie != "authenticated")
            {
                return Results.Unauthorized();
            }

            var query = db.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(u =>
                    (u.UserName != null && u.UserName.Contains(search)) ||
                    (u.Email != null && u.Email.Contains(search)));
            }

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

            return Results.Ok(new
            {
                message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully",
                isActive = user.IsActive
            });
        });

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

            return Results.Ok(new
            {
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

        return app;
    }
}
