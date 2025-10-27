using MAE_WebAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAE_WebAPI.Auth;

public class RefreshToken{
    [Key]
    public string Id {get; set;}
    public string Token { get; set;}
    public string UserId {get; set;}
    public DateTime ExpiresOnUTC {get; set;}
    [ForeignKey(nameof(UserId))]
    public ApplicationUser User {get; set;}

    private RefreshToken(){}

    public RefreshToken(string id, string token, string userId, DateTime expiresOnUTC, ApplicationUser user){
        Id = id;
        Token = token;
        UserId = userId;
        ExpiresOnUTC = expiresOnUTC;
        User = user;
    }
}