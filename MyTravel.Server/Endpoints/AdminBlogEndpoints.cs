using Microsoft.EntityFrameworkCore;
using MyTravel.Server.Data;
using MyTravel.Server.DTOs;

namespace MyTravel.Server.Endpoints;

public static class AdminBlogEndpoints
{
    public static IEndpointRouteBuilder MapAdminBlogEndpoints(this IEndpointRouteBuilder app)
    {
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

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    p.Title.Contains(search) ||
                    p.Excerpt.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p => p.Category == category);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var isPublished = status.ToLower() == "published";
                query = query.Where(p => p.Published == isPublished);
            }

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

            var slug = BlogEndpoints.GenerateSlug(request.Title);

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
                var newSlug = BlogEndpoints.GenerateSlug(request.Title);
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

        return app;
    }
}
