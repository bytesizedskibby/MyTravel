using System.Collections.Concurrent;
using System.Security.Claims;

namespace MyTravel.Server.Endpoints;

public static class ActivityEndpoints
{
    public static IEndpointRouteBuilder MapActivityEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/heartbeat", (
            ClaimsPrincipal user,
            ConcurrentDictionary<string, DateTime> activeUsers) =>
        {
            if (user.Identity?.IsAuthenticated == true)
            {
                var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    activeUsers[userId] = DateTime.UtcNow;
                }
            }
            return Results.Ok();
        });

        app.MapGet("/api/ping", (
            HttpContext httpContext,
            ConcurrentDictionary<string, DateTime> activeUsers) =>
        {
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

        return app;
    }
}
