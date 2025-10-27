using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MAE_WebAPI.Models;

public class StepOption
{
    [Key]
    [StringLength(36)]
    public string Id { get; set; }
    [StringLength(36)]
    public string IdOfStepUsedForData { get; set; }
    public bool IsRealStep { get; set; }

    [StringLength(36)]
    public string TargetParentStepId { get; set; }
    [StringLength(36)]
    public Step TargetParentStep { get; set; }

    public StepOption() { }
    public StepOption(string id, string idOfStepUsedForData, string targetParentStepId, Step targetParentStep, bool isRealStep)
    {
        Id = id;
        IdOfStepUsedForData = idOfStepUsedForData;
        TargetParentStepId = targetParentStepId;
        TargetParentStep = targetParentStep;
        IsRealStep = isRealStep;
    }
}
