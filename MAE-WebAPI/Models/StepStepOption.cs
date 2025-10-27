using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace MAE_WebAPI.Models;

public class StepStepOption
{
    [StringLength(36)]
    public string StepId { get; set; }
    [StringLength(36)]
    public virtual Step Step { get; set; }
    public string StepOptionId { get; set; }
    public virtual StepOption StepOption { get; set; }
}