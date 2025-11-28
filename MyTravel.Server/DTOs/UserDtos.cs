namespace MyTravel.Server.DTOs;

public record UserDto(
    string Id,
    string? UserName,
    string? Email,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    bool IsActive,
    bool EmailConfirmed
);

public record UpdateUserRequest(
    string? UserName,
    bool? IsActive,
    bool? EmailConfirmed
);

public record UserProfileDto(
    string Id,
    string? Email,
    string? FirstName,
    string? LastName,
    string FullName
);

public record UpdateProfileRequest(
    string? FirstName,
    string? LastName
);

public record AdminLoginRequest(string Email, string Password);
