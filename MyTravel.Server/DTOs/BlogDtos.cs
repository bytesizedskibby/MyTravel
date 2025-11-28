namespace MyTravel.Server.DTOs;

public record BlogAuthorDto(
    string Id,
    string Name
);

public record BlogPostDto(
    int Id,
    string Title,
    string Slug,
    string Category,
    string Excerpt,
    string? Content,
    string? ImageUrl,
    bool Published,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    DateTime? PublishedAt,
    BlogAuthorDto? Author
);

public record CreateBlogPostRequest(
    string Title,
    string? Category,
    string? Excerpt,
    string? Content,
    string? ImageUrl,
    string? AuthorId,
    bool Published
);

public record UpdateBlogPostRequest(
    string? Title,
    string? Category,
    string? Excerpt,
    string? Content,
    string? ImageUrl,
    bool? Published
);
