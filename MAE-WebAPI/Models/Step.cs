using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.CompilerServices;

namespace MAE_WebAPI.Models;

public class Step{
    [Key]
    [StringLength(36)]
    public string Id { get; set; }
    [StringLength(36)]
    public string MoveId { get; set; }
    public string Name { get; set; }
    public int StepNumber { get; set; }
    public string? ShortDescription { get; set; }
    public string FullDescription { get; set; }
    public int VideoClipStartTime { get; set; }
    public int VideoClipEndTime { get; set; }
    public virtual List<StepOption> StepOptions { get; set; }

    [ForeignKey(nameof(MoveId))]
    public virtual Move Move { get; set; }

    public Step() { }
    public Step(string id, string moveId, Move move, string name, int stepNumber, string? shortDescription, string fullDescription, int videoClipStartTime, int videoClipEndTime, List<StepOption> stepOptions)
    {
        Id = id;
        MoveId = moveId;
        Move = move;
        Name = name;
        StepNumber = stepNumber;
        ShortDescription = shortDescription;
        FullDescription = fullDescription;
        VideoClipStartTime = videoClipStartTime;
        VideoClipEndTime = videoClipEndTime;
        StepOptions = stepOptions;
    }
}
