using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.DTOs;
using System.Text.RegularExpressions;

namespace MyTravel.Server.Endpoints;

public static class BlogEndpoints
{
    public static IEndpointRouteBuilder MapBlogEndpoints(this IEndpointRouteBuilder app)
    {
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

        return app;
    }

    public static string GenerateSlug(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return string.Empty;

        var slug = title.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        slug = slug.Trim('-');
        return slug;
    }
}
