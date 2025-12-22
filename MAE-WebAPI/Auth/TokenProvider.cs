using System.Security.Claims;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using MAE_WebAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text.RegularExpressions;

namespace MAE_WebAPI.Auth;

public class TokenProvider(IConfiguration configuration){
    private readonly string _secret = configuration["JwtSettings:Key"]!;
    private readonly string _issuer = configuration["JwtSettings:Issuer"]!;
    private readonly string _audience = configuration["JwtSettings:Audience"]!;
    
    public string CreateTokenUsingUser(ApplicationUser user)
    {
        var claims = new[]{
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("userName", user.UserName),
        };

        return GenerateToken(claims);
    }

    // public string CreateTokenUsingClaims(ClaimsPrincipal principal) {
    //     var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
    //         ?? principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    //     var email = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value
    //         ?? principal.FindFirst(ClaimTypes.Email)?.Value;
    //     var firstName = principal.FindFirst("firstName")?.Value;
    //     var lastName = principal.FindFirst("lastName")?.Value;

    //     var claims = new[]
    //     {
    //         new Claim(JwtRegisteredClaimNames.Sub, userId),
    //         new Claim(JwtRegisteredClaimNames.Email, email),
    //         new Claim("firstName", firstName ?? ""),
    //         new Claim("lastName", lastName ?? ""),
    //     };

    //     return GenerateToken(claims);
    // }

    private string GenerateToken(IEnumerable<Claim> claims){
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience, 
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(configuration.GetValue<int>("JwtSettings:ExpirationInMinutes")),
            signingCredentials: credentials
        );

        var handler = new JwtSecurityTokenHandler();

        return handler.WriteToken(token);
    }

    public string GenerateRandomToken()
    {
        var bytes = new byte[32]; // 256-bit
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private string GenerateToken(IEnumerable<Claim> claims, double minutesTillExpiry){
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience, 
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutesTillExpiry),
            signingCredentials: credentials
        );

        var handler = new JwtSecurityTokenHandler();

        return handler.WriteToken(token);
    }

    private static readonly Regex Sha256Regex =
    new Regex("^[a-fA-F0-9]{64}$", RegexOptions.Compiled);

    public bool ValidateTokenHash(string tokenHash)
    {
        if (string.IsNullOrEmpty(tokenHash) || !Sha256Regex.IsMatch(tokenHash))
        {
            return false;
        }
        return true;
    } 
}
