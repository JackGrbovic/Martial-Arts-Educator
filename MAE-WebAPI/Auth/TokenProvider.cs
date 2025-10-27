using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MAE_WebAPI.Models;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace MAE_WebAPI.Auth;

public class TokenProvider(IConfiguration configuration){
    private readonly string _secret = configuration["JwtSettings:Key"]!;
    private readonly string _issuer = configuration["JwtSettings:Issuer"]!;
    private readonly string _audience = configuration["JwtSettings:Audience"]!;
    
    public string CreateAccessToken(ApplicationUser user, string ipAddress)
    {
        var claims = new[]{
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName),
            new Claim("ip", ipAddress)
        };

        return GenerateToken(claims);
    }
    
    public string CreateAccessToken(ClaimsPrincipal principal, string ipAddress) {
        var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
            ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value
            ?? principal.FindFirst(ClaimTypes.Email)?.Value;
        var firstName = principal.FindFirst("firstName")?.Value;
        var lastName = principal.FindFirst("lastName")?.Value;

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("firstName", firstName ?? ""),
            new Claim("lastName", lastName ?? ""),
            new Claim("ip", ipAddress)
        };

        return GenerateToken(claims);
    }

    private string GenerateToken(IEnumerable<Claim> claims){
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor{
            Subject = new ClaimsIdentity(claims),
            // Expires = DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("JwtSettings:ExpirationInMinutes")),
            SigningCredentials = credentials,
            Issuer = _issuer,
            Audience = _audience, 
        };

        var handler = new JsonWebTokenHandler();

        string token = handler.CreateToken(tokenDescriptor);
        return token;
    }

    // public RefreshToken CreateRefreshToken(ApplicationUser user){
    //     return new RefreshToken(
    //         new Guid().ToString(),
    //         Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
    //         user.Id,
    //         DateTime.UtcNow.AddMinutes(1),
    //         user
    //     );
    // }
}
