import { TestMove, TestStep, TestStepOption } from "../../../data/types"


export type PackagedIncorrectAnswersObject = {
    movesWithPackagedIncorrectSteps : MovesWithPackagedIncorrectSteps[]
}

type MovesWithPackagedIncorrectSteps = {
    pairedAnswers : AnswerPair[]
}

export type AnswerPair = {
    moveName : string,
    stepNumber : number,
    correct : TestStepOption,
    incorrect : TestStepOption
}

export default function PackageIncorrectAnswers(inputMoves : TestMove[]){
    let packagedincorrectAnswersObject : PackagedIncorrectAnswersObject = {
        movesWithPackagedIncorrectSteps: []
    };

    for (let i = 0; i < inputMoves.length; i++){
        packagedincorrectAnswersObject.movesWithPackagedIncorrectSteps = [...packagedincorrectAnswersObject.movesWithPackagedIncorrectSteps, 
        { 
            pairedAnswers: (GetAnswerForEachStepOfAMove(inputMoves[i].steps, inputMoves[i].name))
        }]
    }

    return packagedincorrectAnswersObject;
}

function GetAnswerForEachStepOfAMove(steps : TestStep[], name : string){
    let answerPairs : AnswerPair[] = [];
    
    for (let i = 0; i < steps.length; i++){
        let answerPair : AnswerPair | undefined = PairCorrectAndIncorrectSteps(steps[i].stepOptions, steps[i].stepNumber, name);
        if (answerPair != undefined) answerPairs.push(answerPair);
    }

    return answerPairs;
    ;
}

function PairCorrectAndIncorrectSteps(stepOptions : TestStepOption[], stepNumber : number, moveName : string){
    let answerPair : AnswerPair = {
        moveName: moveName,
        stepNumber: stepNumber,
        correct: {} as TestStepOption,
        incorrect: {} as TestStepOption
    }

    for (let j = 0; j < stepOptions.length; j++){
        if (stepOptions[j].isRealStep && stepOptions[j].selected) return;
        if (stepOptions[j].isRealStep) answerPair.correct = stepOptions[j];
        if (!stepOptions[j].isRealStep && stepOptions[j].selected) answerPair.incorrect = stepOptions[j];
    }

    return answerPair;
}

//follow this pattern for for loops
