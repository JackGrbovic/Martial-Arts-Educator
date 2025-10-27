using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MAE_WebAPI.Models;

public class Move{
    [Key]
    [StringLength(36)]
    public string Id { get; set; }
    public string Name { get; set; }
    public string MartialArtId { get; set; }
    public string Url { get; set; }
    public int LearningOrderNumber { get; set; }
    public string? ShortName { get; set; }


    [ForeignKey(nameof(MartialArtId))]
    public virtual MartialArt MartialArt { get; set; }
    public virtual List<Step> Steps { get; set; }

    public Move() { }

    public Move(string id, string name, string martialArtId, string url, List<Step> steps, string shortName)
    {
        Id = id;
        Name = name;
        MartialArtId = martialArtId;
        Url = url;
        Steps = steps;
        ShortName = shortName;
    }
}