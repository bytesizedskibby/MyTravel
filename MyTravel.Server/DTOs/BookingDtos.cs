namespace MyTravel.Server.DTOs;

public record CreateBookingRequest(
    string? CustomerEmail,
    string? CustomerName,
    string? PaymentReference,
    List<CreateBookingItemRequest> Items
);

public record CreateBookingItemRequest(
    string Type,
    string Title,
    string Details,
    decimal Price,
    string? ImageUrl
);

public record BookingDto(
    int Id,
    string CustomerEmail,
    string CustomerName,
    decimal TotalAmount,
    string Status,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? CancelledAt,
    string? PaymentReference,
    List<BookingItemDto> Items
);

public record BookingItemDto(
    int Id,
    string Type,
    string Title,
    string Details,
    decimal Price,
    string? ImageUrl
);

public record UpdateBookingStatusRequest(string Status);
