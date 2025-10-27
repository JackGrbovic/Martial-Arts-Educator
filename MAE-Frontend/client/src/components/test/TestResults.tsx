import React, { useState } from "react";
import { PackagedIncorrectAnswersObject, AnswerPair } from "./testFunctions/PackageIncorrectAnswers";
import { useNavigate } from "react-router-dom";

interface TestResultsProps {
    correctCounter : number;
    totalCounter : number;
    incorrectAnswerPairsObject : PackagedIncorrectAnswersObject | undefined;
    DetermineOptionColorForResults : Function
}

//the number of correct seems to be good, but the correct and incorrect answers are showing strangely
export default function TestResults({correctCounter, totalCounter, incorrectAnswerPairsObject, DetermineOptionColorForResults} : TestResultsProps){
    const navigate = useNavigate();

    return(
        <div className="full-width-and-height" style={{alignItems: 'center', justifyItems: 'center'}}>
            
           <div className="align-center" style={{width: '300px', marginTop: '20px'}}>
                <div className="space-between-row-container large-button-height">
                    <div className="button color-2 background-color-1">
                        <p className="answer-text">You scored:</p>
                    </div>
                    <div className="hollow-container color-1">
                        <p className="answer-text">
                            {correctCounter} / {totalCounter}
                        </p>
                    </div>
                </div>
            </div> 

            

            {
                incorrectAnswerPairsObject && 
                <div className="hollow-container scrollable-answer-container color-1" style={{width: '80%', marginTop: '20px', flexWrap: 'wrap'}}>
                    {
                        incorrectAnswerPairsObject.movesWithPackagedIncorrectSteps.map((move, key) => {
                            return <WrongAnswersFromStepOptions pairedAnswers = {move.pairedAnswers} DetermineOptionColorForResults = {DetermineOptionColorForResults} />
                        })
                    }
                </div>
            }
        </div>
        
        
    )
}

interface WrongAnswersFromStepOptionsProps {
    pairedAnswers : AnswerPair[];
    DetermineOptionColorForResults : Function
}

function WrongAnswersFromStepOptions({pairedAnswers, DetermineOptionColorForResults} : WrongAnswersFromStepOptionsProps){
    return pairedAnswers.map((answerPair, index) => (answerPair &&
        <button key={index} className='remove-button-style space-between-row-container full-width-and-height' style={{marginTop: index === 0 ? '10px' : '30px', flexWrap: 'wrap'}}>
            <p className="medium-title">{answerPair.moveName}: Step {answerPair.stepNumber}</p>
            <div className={`answer-container larger-button-height flex-grow-1 color-1 ${DetermineOptionColorForResults(answerPair.incorrect)}`} style={{width: '100%'}}>
                <p className='answer-text color-1' style={{fontSize: '15px'}}>
                    <span className='answer-option-name-with-background background-color-1 small-label color-2'>
                        {answerPair.incorrect.name}
                    </span>
                    {answerPair.incorrect.shortDescription ?? answerPair.incorrect.fullDescription}
                </p>
            </div>
            <div className={`answer-container larger-button-height flex-grow-1 color-1 ${DetermineOptionColorForResults(answerPair.correct)}`} style={{marginTop: '10px'}}>
                <p className='answer-text color-1' style={{fontSize: '15px'}}>
                    <span className='answer-option-name-with-background background-color-1 small-label color-2'>
                        {answerPair.correct.name}
                    </span>
                    {answerPair.correct.shortDescription ?? answerPair.correct.fullDescription}
                </p>
            </div>
        </button>
    ))
}
