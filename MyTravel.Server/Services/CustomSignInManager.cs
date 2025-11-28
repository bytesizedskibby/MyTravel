using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using MyTravel.Server.Data;

namespace MyTravel.Server.Services;

public class CustomSignInManager : SignInManager<ApplicationUser>
{
    public CustomSignInManager(
        UserManager<ApplicationUser> userManager,
        IHttpContextAccessor contextAccessor,
        IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory,
        IOptions<IdentityOptions> optionsAccessor,
        ILogger<SignInManager<ApplicationUser>> logger,
        IAuthenticationSchemeProvider schemes,
        IUserConfirmation<ApplicationUser> confirmation)
        : base(userManager, contextAccessor, claimsFactory, optionsAccessor, logger, schemes, confirmation)
    {
    }

    public override async Task<bool> CanSignInAsync(ApplicationUser user)
    {
        if (!user.IsActive)
        {
            Logger.LogWarning("User {UserId} tried to sign in but is not active.", user.Id);
            return false;
        }

        return await base.CanSignInAsync(user);
    }
}
