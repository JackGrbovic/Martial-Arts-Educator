import { Move, TestMove, TestStep } from "./TestTestData";

export function ScaffoldTestDataFromMoves(argMoves : Move[], stepsData, martialArts){
    //steps need to be added to moves before being passed in

    const testData : TestMove[] = argMoves.map((move) => {
            const moveSteps = move.steps ?? stepsData.filter(step => step.moveId === move.id);

            const testMove : TestMove = {
                id: move.id,
                easeFactor: move.easeFactor ?? null,
                reviewId: move.reviewId ?? null,
                martialArtId: move.martialArtId,
                martialArtName: martialArts.find(ma => ma.id === move.martialArtId).name,
                name: move.name,
                shortName: move.shortName,
                steps: sortStepsIntoStepNumberOrder(moveSteps.map((step) => {
                    const testStep : TestStep = {
                        moveId: step.moveId,
                        id: step.id,
                        name: step.name,
                        stepNumber: step.stepNumber,
                        fullDescription: step.fullDescription,
                        answered: false,
                        stepOptions: RandomiseStepOptions(ScaffoldStepOptionsUsingStepData(step.stepOptions, stepsData))
                    }

                    return testStep
                }))
            }

            return testMove;
        }
    ).filter((move) => move !== undefined)

    return testData;
}

//this returns only 1s and 2s, figure out the algo to make it work
function sortStepsIntoStepNumberOrder(steps){
    let orderedSteps = steps;

    orderedSteps.sort((a, b) => a.stepNumber - b.stepNumber);

    return orderedSteps;
}

function RandomiseStepOptions(stepOptions){
    let randomNumbers : number[] = [];

    while (randomNumbers?.length < stepOptions.length){
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

export default function ScaffoldStepOptionsUsingStepData(stepOptions, stepsData){
    try{
        let newStepOptions = [];
        const presentStepOptionsById = [];
        for (let step of stepsData){
            for (let stepOption of stepOptions){
                if (step.id === stepOption.targetParentStepId) presentStepOptionsById.push(stepOption);
            }
        }

        for (let stepOption of presentStepOptionsById){
            for (let stepWithData of stepsData){
                if (stepWithData.id === stepOption.idOfStepUsedForData) {
                    const stepOptionToReturn = {
                        id: stepOption.id,
                        targetParentStepId: stepOption.targetParentStepId,
                        isRealStep: stepOption.isRealStep,
                        name: stepWithData.name,
                        shortDescription: stepWithData.shortDescription,
                        fullDescription: stepWithData.fullDescription
                    }
                    stepOptionToReturn && newStepOptions.push(stepOptionToReturn)
                }
            }
        }
            
        return newStepOptions;
    } catch (ex){
        console.error('thing not work ', ex);
    }
}
