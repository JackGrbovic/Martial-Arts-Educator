using MAE_WebAPI.Models;

public class LearnedMoveDto {
    public string Id { get; set; }
    public string MoveId { get; set; }
    public string UserId { get; set; }
    public string MartialArtId { get; set; }
    public double EaseFactor { get; set; }
    public DateTime NextReviewDate { get; set; }
    public List<StepDto> Steps{ get; set; }
}

public class UpdateLearnedMoveDto
{
    public string MoveId { get; set; }
    public List<StepDto> Steps{ get; set; }
}

public class StepDto {
    public bool IsCorrect { get; set; }
}
