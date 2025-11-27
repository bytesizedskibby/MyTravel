using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace MyTravel.Server.Services;

public class EmailSender : IEmailSender<Data.ApplicationUser>
{
    public Task SendConfirmationLinkAsync(Data.ApplicationUser user, string email, string confirmationLink)
    {
        Console.WriteLine($"Sending Confirmation Link to {email}: {confirmationLink}");
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(Data.ApplicationUser user, string email, string resetCode)
    {
        Console.WriteLine($"Sending Password Reset Code to {email}: {resetCode}");
        return Task.CompletedTask;
    }

    public Task SendPasswordResetLinkAsync(Data.ApplicationUser user, string email, string resetLink)
    {
        Console.WriteLine($"Sending Password Reset Link to {email}: {resetLink}");
        return Task.CompletedTask;
    }
}
