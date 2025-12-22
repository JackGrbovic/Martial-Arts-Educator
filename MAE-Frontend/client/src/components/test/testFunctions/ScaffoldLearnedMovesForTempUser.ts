import { LearnedMove, Move, TempUserLearnedMove, User } from "../../../data/types";

export default function ScaffoldLearnedMovesForTempUser(learnedMoves : LearnedMove[], user : User, move : Move){
    let scaffoldedLearnedMoves : TempUserLearnedMove[] = learnedMoves.map((lm) => {
        return {
            id: "",
            moveId: lm.id,
            userId : user.id,
            martialArtId : lm.martialArtId,
        }
    });

    return scaffoldedLearnedMoves
}
