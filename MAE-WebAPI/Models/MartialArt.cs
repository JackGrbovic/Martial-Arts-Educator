using System.ComponentModel.DataAnnotations;

namespace MAE_WebAPI.Models;

public class MartialArt{
    [Key]
    [StringLength(36)]
    public required string Id { get; set; }
    [Required]
    public string Name { get; set; }

    public virtual List<Move> Moves { get; set; }

    public MartialArt() { }
    public MartialArt(string id, string name, List<Move> moves){
        Id = id;
        Name = name;
        Moves = moves;
    }
}