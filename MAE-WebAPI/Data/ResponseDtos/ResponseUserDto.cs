using MAE_WebAPI.Models;

public class ResponseUserDto {
    public string Id { get; set; }
    public string Email { get; set; }
    public string UserName { get; set; }
    public List<LearnedMoveDto> LearnedMoves { get; set; }
    public List<LearnedMoveDto> Reviews { get; set; }
}
