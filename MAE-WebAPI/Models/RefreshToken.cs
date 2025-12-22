using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MAE_WebAPI.Models;
using Microsoft.AspNetCore.Http.HttpResults;

public class RefreshToken
{
    [Key]
    [Required]
    [StringLength(36)]
    public string Id { get; set; }

    [Required]
    public string TokenHash { get; set; }

    [Required]
    public string UserId { get; set; }

    [ForeignKey("UserId")]
    public ApplicationUser ApplicationUser { get; set; }

    public DateTime ExpiryDate { get; set; }

    public DateTime Created { get; set; }

    public bool IsRevoked { get; set; }
    
    public RefreshToken(){}

    public RefreshToken(string id, string tokenHash, string userId, ApplicationUser applicationUser, DateTime expiryDate, DateTime created, bool isRevoked)
    {
        Id = id;
        TokenHash = tokenHash;
        UserId = userId;
        ExpiryDate = expiryDate;
        ApplicationUser = applicationUser;
        Created = created;
        IsRevoked = isRevoked;
    }
}
