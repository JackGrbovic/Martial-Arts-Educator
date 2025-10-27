export default function DetermineIsFinalQuestion(movesLength, currentMoveIndex, currentMoveStepsLength, currentStep){
    if (movesLength === currentMoveIndex +1 && currentStep.stepNumber === currentMoveStepsLength){
        return true
    }
    return false;
}
