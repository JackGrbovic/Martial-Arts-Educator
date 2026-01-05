import React, {useEffect, useState} from "react"
import { LessonStep, Step } from "../test/testFunctions/TestTestData";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext.tsx";

interface LessonBottomRowProps {
    currentStep : LessonStep;
    handleSetCurrentStep : Function;
    steps: Step[];
    martialArtId: string;
    moveId: string;
    setSetupTestFlag: Function;
    rearrangeBottomRow: boolean
}

export default function LessonBottomRow({currentStep, handleSetCurrentStep, steps, setSetupTestFlag, rearrangeBottomRow} : LessonBottomRowProps, ){
    return(
        <>
            <div className='space-between-row-container color-1 lesson-move-description-height' style={{marginTop: '10px', flexWrap: 'nowrap'}}>
                <div className='hollow-container lesson-padding flex-grow-1' style={{overflow: 'scroll', alignItems: 'start', marginRight: '10px'}}>
                    <p className='body-text lesson-description-width-attributes color-10'>{currentStep?.shortDescription ?? currentStep?.fullDescription}</p>
                </div>
                
                <div className='chevron-button-container button-height lesson-chevron-container-width'>
                    {steps.length === currentStep.stepNumber ? (
                        <>
                            <button onClick={() => {handleSetCurrentStep("left")}} className='remove-button-style chevron-selector-button-left hollow-container color-1 border-color-1' style={{width: '50%', borderTopRightRadius: '0', borderBottomRightRadius: '0'}}>
                                <p className='chevron color-10' style={{textAlign: 'center'}}>&lt;</p>
                            </button>
                            <button onClick={() => {setSetupTestFlag(true)}} className='remove-button-style chevron-selector-button-left hollow-container color-1 border-color-1' style={{width: '50%', borderTopLeftRadius: '0', borderBottomLeftRadius: '0'}}>
                                <p className='chevron color-10' style={{textAlign: 'center'}}>&gt;</p>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => {handleSetCurrentStep("left")}} className='remove-button-style chevron-selector-button-left hollow-container color-1 border-color-1' style={{width: '50%', borderTopRightRadius: '0', borderBottomRightRadius: '0'}}>
                                <p className='chevron color-10' style={{textAlign: 'center'}}>&lt;</p>
                            </button>
                            <button onClick={() => {handleSetCurrentStep("right")}} className='remove-button-style chevron-selector-button-left hollow-container color-1 border-color-1' style={{width: '50%', borderTopLeftRadius: '0', borderBottomLeftRadius: '0'}}>
                                <p className='chevron color-10' style={{textAlign: 'center'}}>&gt;</p>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
