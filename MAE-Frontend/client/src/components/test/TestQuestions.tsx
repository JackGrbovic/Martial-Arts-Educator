import React, { useState } from "react";
import { TestStep, TestStepOption } from "../../data/types.ts";
import { useAppContext } from "../../AppContext.tsx";

interface TestQuestionsProps {
    currentStep : TestStep; 
    HandleAnswerQuestion : Function;
    DetermineOptionColor : Function;
    HandleNextQuestion : Function; 
    isFinalQuestion : boolean;
}

//the reason the properties we want output are not being output, is because the stepOption objects only contain references to other objects
//so we could construct an array of stepOptions for this function, constructing them using what's in steps in the react context
//and give them the properties they need
//
export default function TestQuestions({currentStep, HandleAnswerQuestion, DetermineOptionColor, HandleNextQuestion, isFinalQuestion} : TestQuestionsProps){
    const { isMobile } = useAppContext();

    return(
        <div style={{width: '100%', height: '100%'}}>
            {currentStep.stepOptions.map((stepOption, index : number) => (
                <div>
                    {currentStep.answered && currentStep.stepOptions[index].selected ? (
                        <div className="space-between-row-container larger-button-height test-option-margin-top">
                                <div className="answer-wrapper" style={{width: `${isFinalQuestion ? '100%' : '80%'}`}}>
                                    <div className={`answer-container left-only-radius ${DetermineOptionColor(stepOption)}`} style={{width: '100%'}}>
                                        <p className='answer-text color-1' style={{height: '100%'}}>
                                            <span className='answer-option-name-with-background background-color-1 small-label color-2'>
                                                {stepOption.name}
                                            </span>
                                            {stepOption.shortDescription ?? stepOption.fullDescription}
                                        </p>
                                    </div>
                                </div>
                            {!isFinalQuestion && 
                                <button onClick={() => {HandleNextQuestion()}} className='button right-only-radius button-hover next-question-button background-color-2 color-1 border-color-1' style={{width: '20%'}}>
                                    <span className='next-button-text'><span className='link'>Next</span> &rarr;</span>
                                </button>
                            }
                        </div>
                        ) : (
                        <button key={index} onClick={() => {HandleAnswerQuestion(index)}} className='remove-button-style larger-button-height test-option-margin-top clickable' style={{width: '100%'}}>
                            <div className={`answer-wrapper`}>
                                <div className={`answer-container color-1`} style={{width: '100%'}}>
                                    <p className='answer-text color-1' style={{height: '100%'}}>
                                        <span className='answer-option-name-with-background background-color-1 small-label color-2'>
                                            {stepOption.name}
                                        </span>
                                        {stepOption.shortDescription ?? stepOption.fullDescription}
                                    </p>
                                </div>
                            </div>
                        </button>
                        )
                    }
                </div>
                
            
            ))
            }
        </div>
    )
}
