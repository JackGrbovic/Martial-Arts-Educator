using MAE_WebAPI.Data;
using MAE_WebAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace MAE_WebAPI.Auth;

internal sealed class LoginUser(MAEDbContext context, PasswordHasher<ApplicationUser> passwordHasher, TokenProvider tokenProvider){
    
}