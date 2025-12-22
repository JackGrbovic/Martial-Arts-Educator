import { TestStep, TestStepOption, TestMove } from "../../../data/types";

export default function RandomiseStepOptionsForAllTestMoves(movesForTest : TestMove[]){
    let updatedMoves : TestMove[] = JSON.parse(JSON.stringify(movesForTest));
    
    for (let i = 0; i < updatedMoves.length; i++){
        updatedMoves[i].steps = ProcessRandomiseSteps(updatedMoves[i]);
    }

    return updatedMoves;
}

function ProcessRandomiseSteps(updatedMove : TestMove){
    let steps : TestStep[] = updatedMove.steps

    for (let j = 0; j < steps.length; j++){
        const updatedSteps = {
            ...steps[j],
            stepOptions: RandomiseStepOptions(steps[j].stepOptions)
        };
        steps[j] = updatedSteps;
    }

    return steps;
}

function RandomiseStepOptions(stepOptions){
    let randomNumbers : number[] = [];

    while (randomNumbers.length < stepOptions.length){
        let randomNumber : number = Math.floor((Math.random() * stepOptions.length));
        if (!randomNumbers.includes(randomNumber)) {
            randomNumbers.push(randomNumber);
        }
    }

    let randomisedStepOptions : TestStepOption[] = [];

    for (let i = 0; i < stepOptions.length; i++){
        randomisedStepOptions.push(stepOptions[randomNumbers[i]]);
    }

    return randomisedStepOptions;
}
