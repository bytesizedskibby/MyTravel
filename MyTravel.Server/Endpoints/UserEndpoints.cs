using Microsoft.AspNetCore.Identity;
using MyTravel.Server.Data;
using MyTravel.Server.DTOs;
using System.Security.Claims;

namespace MyTravel.Server.Endpoints;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/user", (ClaimsPrincipal user) =>
        {
            return user.Identity?.IsAuthenticated == true
                ? Results.Ok(new { user.Identity.Name, IsAuthenticated = true })
                : Results.Unauthorized();
        });

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

        app.MapPost("/api/logout", async (SignInManager<ApplicationUser> signInManager) =>
        {
            await signInManager.SignOutAsync();
            return Results.Ok();
        });

        return app;
    }
}
