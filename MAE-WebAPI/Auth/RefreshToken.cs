using MAE_WebAPI.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAE_WebAPI.Auth;

public class RefreshToken{
    [Key]
    public string Id {get; set;}
    public string TokenHash { get; set;}
    public string UserId {get; set;}
    public DateTime CreatedAtUTC {get; set;}
    public DateTime ExpiresOnUTC {get; set;}
    [ForeignKey(nameof(UserId))]
    public ApplicationUser User {get; set;}

    private RefreshToken(){}

    public RefreshToken(string id, string tokenHash, string userId, DateTime createdAtUTC, DateTime expiresOnUTC, ApplicationUser user){
        Id = id;
        TokenHash = tokenHash;
        UserId = userId;
        CreatedAtUTC = createdAtUTC;
        ExpiresOnUTC = expiresOnUTC;
        User = user;
    }
}
