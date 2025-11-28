using Microsoft.AspNetCore.Identity;

namespace MyTravel.Server.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // Ensure DB is created
        await db.Database.EnsureCreatedAsync();

        // Check if already seeded
        if (db.Users.Any() || db.Bookings.Any())
        {
            return; // Already seeded
        }

        // Create sample users
        var users = new[]
        {
            new { Email = "john.doe@example.com", FirstName = "John", LastName = "Doe", Password = "Test123!" },
            new { Email = "jane.smith@example.com", FirstName = "Jane", LastName = "Smith", Password = "Test123!" },
            new { Email = "mike.wilson@example.com", FirstName = "Mike", LastName = "Wilson", Password = "Test123!" },
            new { Email = "sarah.johnson@example.com", FirstName = "Sarah", LastName = "Johnson", Password = "Test123!" },
            new { Email = "alex.brown@example.com", FirstName = "Alex", LastName = "Brown", Password = "Test123!" },
        };

        var createdUsers = new List<ApplicationUser>();

        foreach (var userData in users)
        {
            var user = new ApplicationUser
            {
                UserName = userData.Email,
                Email = userData.Email,
                FirstName = userData.FirstName,
                LastName = userData.LastName,
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 60)),
                LastLoginAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(0, 7))
            };

            var result = await userManager.CreateAsync(user, userData.Password);
            if (result.Succeeded)
            {
                createdUsers.Add(user);
            }
        }

        // Create sample bookings
        var bookings = new List<Booking>
        {
            // Confirmed booking with flight + hotel
            new Booking
            {
                UserId = createdUsers[0].Id,
                CustomerEmail = createdUsers[0].Email!,
                CustomerName = createdUsers[0].FullName,
                TotalAmount = 1549.00m,
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddDays(-15),
                ConfirmedAt = DateTime.UtcNow.AddDays(-15),
                PaymentReference = "PAY-1732500000001",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Flight, Title = "NYC → Paris", Details = "Round trip, Economy • Dec 15-22", Price = 899.00m },
                    new BookingItem { Type = BookingItemType.Hotel, Title = "Hotel Le Marais", Details = "Paris • 7 nights • Deluxe Room", Price = 650.00m }
                }
            },
            // Completed booking with tour
            new Booking
            {
                UserId = createdUsers[1].Id,
                CustomerEmail = createdUsers[1].Email!,
                CustomerName = createdUsers[1].FullName,
                TotalAmount = 2199.00m,
                Status = BookingStatus.Completed,
                CreatedAt = DateTime.UtcNow.AddDays(-45),
                ConfirmedAt = DateTime.UtcNow.AddDays(-45),
                PaymentReference = "PAY-1732500000002",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Tour, Title = "Safari Adventure", Details = "Kenya • 5 days • All inclusive", Price = 2199.00m }
                }
            },
            // Pending booking
            new Booking
            {
                UserId = createdUsers[2].Id,
                CustomerEmail = createdUsers[2].Email!,
                CustomerName = createdUsers[2].FullName,
                TotalAmount = 750.00m,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                PaymentReference = "PAY-1732500000003",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Flight, Title = "LA → Tokyo", Details = "One way, Business • Jan 10", Price = 750.00m }
                }
            },
            // Cancelled booking
            new Booking
            {
                UserId = createdUsers[3].Id,
                CustomerEmail = createdUsers[3].Email!,
                CustomerName = createdUsers[3].FullName,
                TotalAmount = 320.00m,
                Status = BookingStatus.Cancelled,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                CancelledAt = DateTime.UtcNow.AddDays(-8),
                PaymentReference = "PAY-1732500000004",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Hotel, Title = "Beachside Resort", Details = "Miami • 3 nights • Standard Room", Price = 320.00m }
                }
            },
            // Guest booking (no user)
            new Booking
            {
                UserId = null,
                CustomerEmail = "guest@example.com",
                CustomerName = "Guest User",
                TotalAmount = 1250.00m,
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                ConfirmedAt = DateTime.UtcNow.AddDays(-5),
                PaymentReference = "PAY-1732500000005",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Flight, Title = "London → Dubai", Details = "Round trip, First Class • Dec 20-27", Price = 850.00m },
                    new BookingItem { Type = BookingItemType.Tour, Title = "Desert Safari", Details = "Dubai • 1 day • Dinner included", Price = 400.00m }
                }
            },
            // Recent confirmed booking
            new Booking
            {
                UserId = createdUsers[4].Id,
                CustomerEmail = createdUsers[4].Email!,
                CustomerName = createdUsers[4].FullName,
                TotalAmount = 489.00m,
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                ConfirmedAt = DateTime.UtcNow.AddDays(-1),
                PaymentReference = "PAY-1732500000006",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Hotel, Title = "Mountain Lodge", Details = "Swiss Alps • 4 nights • Suite", Price = 489.00m }
                }
            },
            // Today's booking
            new Booking
            {
                UserId = createdUsers[0].Id,
                CustomerEmail = createdUsers[0].Email!,
                CustomerName = createdUsers[0].FullName,
                TotalAmount = 1899.00m,
                Status = BookingStatus.Confirmed,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                ConfirmedAt = DateTime.UtcNow.AddHours(-2),
                PaymentReference = "PAY-1732500000007",
                Items = new List<BookingItem>
                {
                    new BookingItem { Type = BookingItemType.Flight, Title = "Sydney → Bali", Details = "Round trip, Business • Jan 5-15", Price = 1200.00m },
                    new BookingItem { Type = BookingItemType.Hotel, Title = "Bali Beach Villa", Details = "Bali • 10 nights • Private Villa", Price = 699.00m }
                }
            },
        };

        db.Bookings.AddRange(bookings);
        await db.SaveChangesAsync();
    }
}
