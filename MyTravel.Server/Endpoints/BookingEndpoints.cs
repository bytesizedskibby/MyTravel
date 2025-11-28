using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.DTOs;
using System.Security.Claims;

namespace MyTravel.Server.Endpoints;

public static class BookingEndpoints
{
    public static IEndpointRouteBuilder MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
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

        return app;
    }
}
