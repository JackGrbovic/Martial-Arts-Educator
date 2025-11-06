import React, {use, useContext, useEffect, useState} from 'react';
import LessonVideo from './LessonVideo.tsx';
import LessonBottomRow from './LessonBottomRow.tsx';
import Test from '../test/Test.tsx'
import { LessonMove, LessonStep, Step, Move } from '../test/testFunctions/TestTestData.ts';
import { ScaffoldTestDataFromMoves } from '../test/testFunctions/ScaffoldTestDataFromIds.ts';
import { AppContext, useAppContext } from '../../AppContext.tsx';
import { useNavigate, useParams } from "react-router-dom";

export default function Lesson(){
    const { martialArtId, moveId } = useParams();
    const { martialArts, user, allSteps, windowSize, iframeParentSize, isMobile } = useAppContext()
    const navigate = useNavigate();

    const [setupTestFlag, setSetupTestFlag] = useState(false);
    const [currentMove, setCurrentMove] = useState <Move | null>(null)

    const [steps, setSteps] = useState<LessonStep[] | null>(currentMove?.steps ?? null);

    const [currentStep, setCurrentStep] = useState<LessonStep | null>(null);
    const [testData, setTestData] = useState();

    function handleSetCurrentStep(direction){
        if (steps.length === currentStep?.stepNumber && direction != 'left') {
            return
        }
    
        if (direction === 'right' && steps.length === currentStep?.stepNumber) {
            return;
        }
        else if (direction === "left" && currentStep.stepNumber-1 === 0){
            return;
        }
        else if (direction === "right"){
            setCurrentStep(steps[currentStep.stepNumber] as Step);
            return;
        }
        else if (direction === "left"){
            setCurrentStep(steps[currentStep.stepNumber - 2] as Step)
            return;
        }
    }

    function handleSetUpTest(){
        if (testData) return
            let moveArray : LessonMove[] = [currentMove];
            setTestData(ScaffoldTestDataFromMoves(moveArray, allSteps, martialArts));
    }

    useEffect(() => {
    }, [])

    console.log("currentMove", currentMove)

    useEffect(() => {
        martialArts && moveId && setCurrentMove(martialArts.find(ma => ma.id === martialArtId)?.moves.find(m => m.id === moveId))
;    }, [martialArts, moveId])

    useEffect(() => {
        //the below is messy
        setupTestFlag && handleSetUpTest();
    }, [setupTestFlag])

    const [rearrangeBottomRow, setRearrangeBottomRow] = useState(false);

    useEffect(() => {
        if (windowSize[0] < 800) setRearrangeBottomRow(true)
            else setRearrangeBottomRow(false);
    }, [windowSize])

    //get width and height of lesson-container then feed that to lesson video
    
    const [videoHeight, setVideoHeight] = useState<number>();

    useEffect(() => {
        handleSetVideoSize();
    }, iframeParentSize);

    useEffect(() => {
        handleSetVideoSize();
        
        currentMove && handleSetStepsAndCurrentStep();
        
    }, [currentMove]);

    console.log("steps", steps)

    function handleSetStepsAndCurrentStep(){
        let correctlyOrderedSteps = []
        const originalSteps = JSON.parse(JSON.stringify(currentMove?.steps));
        for (let i = 0; i < originalSteps.length; i++){
            const step = (originalSteps.find(s => s.stepNumber === i + 1))
            step && correctlyOrderedSteps.push(step);
        }
        setSteps(correctlyOrderedSteps);
        setCurrentStep(correctlyOrderedSteps[0] as LessonStep ?? null)
    }

    const handleSetVideoSize = () => {
        if (isMobile && iframeParentSize[0] > 800) setVideoHeight(600);
        else if (iframeParentSize[0] < 800 && iframeParentSize[0] > 450) setVideoHeight(300);
        else if (iframeParentSize[0] < 450) setVideoHeight(200);
        else if (!isMobile) setVideoHeight(780);
    }

    return(
        <div className='full-width-and-height'>
            {!testData ? (
                <div className='lesson-container' style={{marginTop: '20px'}} id="iframeParent">
                    <div className='full-width flex'>
                        <p onClick={(e)=> {
                            navigate('/dashboard');
                        }} className="color-1 secondary-font back-to-dashboard-text">
                            ← Dashboard 
                        </p>
                    </div>
                    
                    <p className='medium-title color-1 lesson-move-name'>{currentMove && currentMove.name}: {currentStep?.name }</p>
                    {steps && currentStep && (
                        <>
                            <LessonVideo videoHeight={videoHeight} url={currentMove && currentMove.url} startTime={currentStep?.videoClipStartTime} endTime={currentStep?.videoClipEndTime} />
                            <LessonBottomRow rearrangeBottomRow={rearrangeBottomRow} currentStep={currentStep} handleSetCurrentStep={handleSetCurrentStep} steps={steps && steps} setSetupTestFlag={setSetupTestFlag}/>
                        </>
                    )}

                </div>) : (
                    <Test isReviewsArg={false} testData={testData} navigationTarget={'/dashboard'}/>
                )
            }
        </div>
    )
}
