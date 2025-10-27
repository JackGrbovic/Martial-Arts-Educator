using MAE_WebAPI.Models;

public class LearnedMoveDto {
    public string MoveId { get; set; }
    public List<StepDto> Steps { get; set; } 
}

public class StepDto {
    public bool IsCorrect { get; set; }
}
