using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MyTravel.Server.Data;

public class ApplicationUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
}

public class BlogPost
{
    public int Id { get; set; }
    public string? AuthorId { get; set; }
    public ApplicationUser? Author { get; set; }
    
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // "solo-travel", "family-trips", "luxury-travel"
    public string Excerpt { get; set; } = string.Empty;
    public string? Content { get; set; } // JSON string for Lexical editor state
    public string? ImageUrl { get; set; }
    
    public bool Published { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public enum BookingItemType
{
    Flight,
    Hotel,
    Tour
}

public class Booking
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    
    public decimal TotalAmount { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    
    public string? PaymentReference { get; set; }
    
    public ICollection<BookingItem> Items { get; set; } = new List<BookingItem>();
}

public class BookingItem
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    
    public BookingItemType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
}

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }
    
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<BookingItem> BookingItems { get; set; }
    public DbSet<BlogPost> BlogPosts { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
        });
        
        builder.Entity<Booking>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status).HasConversion<string>();
            
            entity.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.SetNull);
                
            entity.HasMany(b => b.Items)
                .WithOne(i => i.Booking)
                .HasForeignKey(i => i.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        
        builder.Entity<BookingItem>(entity =>
        {
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Type).HasConversion<string>();
        });
        
        builder.Entity<BlogPost>(entity =>
        {
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("datetime('now')");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("datetime('now')");
            entity.HasIndex(e => e.Slug).IsUnique();
            
            entity.HasOne(b => b.Author)
                .WithMany(u => u.BlogPosts)
                .HasForeignKey(b => b.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
