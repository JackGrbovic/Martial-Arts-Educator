using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace MAE_WebAPI.Models;

public class ApplicationUser : IdentityUser{
    [Required]
    [StringLength(36)]
    [Key]
    public override string Id { get; set; }
    [Required]
    [StringLength(36)]
    public string FirstName { get; set; }
    [Required]
    [StringLength(36)]
    public string LastName { get; set; }
    public ICollection<LearnedMove> LearnedMoves { get; set; } = new List<LearnedMove>();

    public ApplicationUser(){}

    public ApplicationUser(string id, string userName, string firstName, string lastName, string normalizedEmail, List<LearnedMove> learnedMoves){
        Id = id;
        UserName = userName;
        NormalizedEmail = normalizedEmail;
        FirstName = firstName;
        LastName = lastName;
        LearnedMoves = learnedMoves;
    }
}