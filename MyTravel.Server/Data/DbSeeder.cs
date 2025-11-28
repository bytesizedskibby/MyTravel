using Microsoft.AspNetCore.Identity;
using System.Text.Json;

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
        
        // Create sample blog posts
        var blogPosts = new List<BlogPost>
        {
            new BlogPost
            {
                AuthorId = createdUsers[0].Id,
                Title = "10 Hidden Gems in Europe You Must Visit",
                Slug = "10-hidden-gems-in-europe-you-must-visit",
                Category = "solo-travel",
                Excerpt = "Move over Paris and Rome. Here are 10 underrated European destinations that deserve a spot on your bucket list.",
                Content = CreateLexicalContent(new[] {
                    ("paragraph", "Europe is home to countless breathtaking destinations, but some of the most magical places remain off the beaten path. While cities like Paris, Rome, and Barcelona attract millions of tourists each year, there are hidden gems scattered across the continent that offer equally stunning experiences without the crowds."),
                    ("heading", "1. Hallstatt, Austria"),
                    ("paragraph", "This picturesque village sits on the shores of Lake Hallstatt, surrounded by towering Alpine peaks. With its charming pastel-colored houses and rich salt-mining history, Hallstatt feels like stepping into a fairy tale."),
                    ("heading", "2. Colmar, France"),
                    ("paragraph", "Often called 'Little Venice,' Colmar in the Alsace region features half-timbered houses painted in vibrant colors lining cobblestone streets. The town's blend of French and German influences creates a unique cultural experience.")
                }),
                ImageUrl = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
                Published = true,
                PublishedAt = DateTime.UtcNow.AddDays(-45),
                CreatedAt = DateTime.UtcNow.AddDays(-45),
                UpdatedAt = DateTime.UtcNow.AddDays(-45)
            },
            new BlogPost
            {
                AuthorId = createdUsers[1].Id,
                Title = "A Guide to Solo Travel in Japan",
                Slug = "a-guide-to-solo-travel-in-japan",
                Category = "solo-travel",
                Excerpt = "Everything you need to know about traveling alone in Japan, from rail passes to dining etiquette.",
                Content = CreateLexicalContent(new[] {
                    ("paragraph", "Japan is one of the safest and most rewarding destinations for solo travelers. From the neon-lit streets of Tokyo to the serene temples of Kyoto, the country offers an incredible mix of ancient traditions and cutting-edge modernity."),
                    ("heading", "Getting Around: The JR Pass"),
                    ("paragraph", "The Japan Rail Pass is your best friend for long-distance travel. Purchase it before arriving in Japan and enjoy unlimited travel on JR trains, including most shinkansen (bullet trains)."),
                    ("heading", "Dining Solo: Embrace the Counter"),
                    ("paragraph", "Japanese dining culture is perfect for solo travelers. Ramen shops, sushi counters, and izakayas all feature counter seating where dining alone is completely normal.")
                }),
                ImageUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
                Published = true,
                PublishedAt = DateTime.UtcNow.AddDays(-30),
                CreatedAt = DateTime.UtcNow.AddDays(-30),
                UpdatedAt = DateTime.UtcNow.AddDays(-30)
            },
            new BlogPost
            {
                AuthorId = createdUsers[2].Id,
                Title = "Luxury on a Budget: Maldives Edition",
                Slug = "luxury-on-a-budget-maldives-edition",
                Category = "luxury-travel",
                Excerpt = "Yes, it is possible to experience the Maldives without breaking the bank. Here are our top tips.",
                Content = CreateLexicalContent(new[] {
                    ("paragraph", "Yes, it is possible to experience the Maldives without emptying your bank account. While the destination is known for ultra-luxury resorts with eye-watering price tags, savvy travelers can enjoy crystal-clear waters and pristine beaches on a fraction of the typical budget."),
                    ("heading", "Stay on Local Islands"),
                    ("paragraph", "Since 2009, the Maldives has allowed guesthouses on local islands. Towns like Maafushi, Thulusdhoo, and Dhigurah offer budget-friendly accommodations starting at $50-80 per night."),
                    ("heading", "Book Resort Day Passes"),
                    ("paragraph", "Many luxury resorts offer day passes that include lunch, pool access, and beach time. For around $100-200, you can experience resort life without the overnight rates.")
                }),
                ImageUrl = "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
                Published = true,
                PublishedAt = DateTime.UtcNow.AddDays(-20),
                CreatedAt = DateTime.UtcNow.AddDays(-20),
                UpdatedAt = DateTime.UtcNow.AddDays(-20)
            },
            new BlogPost
            {
                AuthorId = createdUsers[3].Id,
                Title = "Planning the Perfect Family Trip to Switzerland",
                Slug = "planning-the-perfect-family-trip-to-switzerland",
                Category = "family-trips",
                Excerpt = "From scenic train rides to kid-friendly hiking trails, Switzerland offers endless adventures for the whole family.",
                Content = CreateLexicalContent(new[] {
                    ("paragraph", "Switzerland is a dream destination for families, offering stunning Alpine scenery, outdoor adventures for all ages, and world-class infrastructure that makes traveling with kids a breeze."),
                    ("heading", "Best Time to Visit"),
                    ("paragraph", "Summer (June-August) is ideal for hiking, lake swimming, and cable car rides. Winter (December-March) offers excellent skiing at family-friendly resorts like Grindelwald and Verbier."),
                    ("heading", "Kid-Friendly Activities"),
                    ("paragraph", "Take the Glacier Express for a scenic train journey, visit the Swiss Transport Museum in Lucerne, or explore the Ballenberg Open-Air Museum.")
                }),
                ImageUrl = "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
                Published = true,
                PublishedAt = DateTime.UtcNow.AddDays(-10),
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                UpdatedAt = DateTime.UtcNow.AddDays(-10)
            },
            new BlogPost
            {
                AuthorId = createdUsers[4].Id,
                Title = "Ultimate Luxury Honeymoon in Santorini",
                Slug = "ultimate-luxury-honeymoon-in-santorini",
                Category = "luxury-travel",
                Excerpt = "Plan the perfect romantic getaway to Santorini with our guide to the best luxury hotels, dining, and experiences.",
                Content = CreateLexicalContent(new[] {
                    ("paragraph", "Santorini's dramatic caldera views, world-famous sunsets, and exclusive cave hotels make it one of the most romantic destinations on Earth."),
                    ("heading", "Where to Stay"),
                    ("paragraph", "Oia and Imerovigli offer the most luxurious accommodations with private plunge pools and unobstructed caldera views."),
                    ("heading", "Romantic Experiences"),
                    ("paragraph", "Book a private sunset catamaran cruise, arrange a couples' wine tasting at Santo Wines, or dine at Selene for Michelin-quality Greek cuisine.")
                }),
                ImageUrl = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
                Published = true,
                PublishedAt = DateTime.UtcNow.AddDays(-5),
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                UpdatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new BlogPost
            {
                AuthorId = createdUsers[0].Id,
                Title = "Draft: Best Beaches for 2025",
                Slug = "draft-best-beaches-for-2025",
                Category = "luxury-travel",
                Excerpt = "Our upcoming guide to the best beaches around the world for your 2025 vacation.",
                Content = CreateLexicalContent(new[] {
                    ("paragraph", "This is a draft post that is still being worked on. Stay tuned for the full guide!"),
                }),
                ImageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
                Published = false,
                PublishedAt = null,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
        };
        
        db.BlogPosts.AddRange(blogPosts);
        await db.SaveChangesAsync();
    }
    
    private static string CreateLexicalContent((string type, string text)[] blocks)
    {
        var children = blocks.Select(b => b.type == "heading" 
            ? new {
                children = new[] { new { detail = 0, format = 0, mode = "normal", style = "", text = b.text, type = "text", version = 1 } },
                direction = "ltr",
                format = "",
                indent = 0,
                type = "heading",
                version = 1,
                tag = "h2"
            } as object
            : new {
                children = new[] { new { detail = 0, format = 0, mode = "normal", style = "", text = b.text, type = "text", version = 1 } },
                direction = "ltr",
                format = "",
                indent = 0,
                type = "paragraph",
                version = 1
            } as object
        ).ToArray();
        
        var root = new {
            root = new {
                children = children,
                direction = "ltr",
                format = "",
                indent = 0,
                type = "root",
                version = 1
            }
        };
        
        return JsonSerializer.Serialize(root);
    }
}
