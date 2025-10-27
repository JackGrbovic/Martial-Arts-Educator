export default function DetermineTestScore(moves, setTotalCounter, setCorrectCounter){
        let updatedTotalCounter = 0;
        let updatedCorrectCounter = 0;

        for (let i = 0; i < moves.length; i++){
            const countersDeterminedFromSteps = DetermineCountersFromSteps(moves[i].steps)
            updatedTotalCounter += countersDeterminedFromSteps.updatedTotalCounter;
            updatedCorrectCounter += countersDeterminedFromSteps.updatedCorrectCounter;
        }

        setTotalCounter(updatedTotalCounter);
        setCorrectCounter(updatedCorrectCounter);
    }

function DetermineCountersFromSteps(steps){
    let countersDeterminedFromSteps = {
        updatedTotalCounter: 0,
        updatedCorrectCounter: 0
    }

    for (let i = 0; i < steps.length; i++){
        const countersDeterminedFromStepOptions = DetermineCountersFromStepOptions(steps[i].stepOptions)
        countersDeterminedFromSteps.updatedTotalCounter += countersDeterminedFromStepOptions.updatedTotalCounter;
        countersDeterminedFromSteps.updatedCorrectCounter += countersDeterminedFromStepOptions.updatedCorrectCounter;
    }

    return countersDeterminedFromSteps;
}

function DetermineCountersFromStepOptions(stepOptions){
    let updatedCounters = {
        updatedCorrectCounter: 0,
        updatedTotalCounter: 0
    }

    for (let j = 0; j < stepOptions.length; j++){
        if (stepOptions[j].isRealStep && stepOptions[j].selected){
            updatedCounters.updatedCorrectCounter += 1;
            updatedCounters.updatedTotalCounter += 1;
        }
        else if (stepOptions[j].selected){
            updatedCounters.updatedTotalCounter += 1;
        }
    }

    return updatedCounters;
}