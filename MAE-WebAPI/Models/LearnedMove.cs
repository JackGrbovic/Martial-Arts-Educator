using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace MAE_WebAPI.Models;

public class LearnedMove{
    [StringLength(36)]
    [Key]
    public string Id { get; set; }
    [Required]
    [StringLength(36)]
    public string MoveId { get; set; }
    [Required]
    [StringLength(36)]
    public string UserId { get; set; }

    public string MartialArtId { get; set; }
    
    public double EaseFactor { get; set; }

    public DateTime NextReviewDate { get; set; }
    
    [ForeignKey(nameof(MoveId))]
    public virtual Move Move { get; set; }
    [ForeignKey(nameof(UserId))]
    public virtual ApplicationUser ApplicationUser{ get; set; }

    public LearnedMove() { }
    public LearnedMove(string id, string moveId, string userId, int easeFactor, DateTime nextReviewDate, ApplicationUser applicationUser, Move move){
        Id = id;
        MoveId = moveId;
        UserId = userId;
        EaseFactor = easeFactor;
        ApplicationUser = applicationUser;
        NextReviewDate = nextReviewDate;
        Move = move;
    }
}
