import React from "react"
import { useAppContext } from "../../AppContext.tsx"

export default function TestTopRow({currentStep, move}){
    const { isMobile } = useAppContext();

    return(
            <div className='space-between-row-container color-1 larger-button-height test-top-row-margin-top'>
                <div className='hollow-container lesson-padding' style={{marginRight: '15px'}}>
                    <p className='medium-title'>Step</p>
                    <div className='button-within-button background-color-1'>
                        <p className='small-label color-2'>{currentStep.stepNumber}</p>
                    </div>
                </div>
                <div className='button lesson-padding background-color-1 larger-button-height' style={{width: '80%'}}>
                    {currentStep.stepNumber === 1 ? (
                        <p className='first-or-next-step-text color-2'>What is the first step?</p>
                    ) : (
                        <p className='first-or-next-step-text color-2'>What is the next step?</p>
                    )
                }
                </div>
            </div>
    )
}
