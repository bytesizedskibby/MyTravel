using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.DTOs;

namespace MyTravel.Server.Endpoints;

public static class AdminBookingEndpoints
{
    public static IEndpointRouteBuilder MapAdminBookingEndpoints(this IEndpointRouteBuilder app)
    {
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

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b =>
                    b.CustomerEmail.Contains(search) ||
                    b.CustomerName.Contains(search) ||
                    b.Id.ToString() == search);
            }

            if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<BookingStatus>(status, true, out var statusEnum))
            {
                query = query.Where(b => b.Status == statusEnum);
            }

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

        return app;
    }
}
