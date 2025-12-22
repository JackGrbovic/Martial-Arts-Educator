using MAE_WebAPI.Models;

public class CompleteRegistrationDto
{
    //do max length and other validation
    public string tokenHash { get; set; }
    public List<TempUserLearnedMoveDto> TempUserLearnedMoves { get; set; }
}

public class TempUserLearnedMoveDto
{
    public string Id { get; set; }
    public string MoveId { get; set; }
    public string UserId { get; set; }
    public string MartialArtId { get; set; }
}
