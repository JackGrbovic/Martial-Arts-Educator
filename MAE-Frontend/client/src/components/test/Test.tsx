import React, {useEffect, useState} from 'react';
import TestQuestions from './TestQuestions.tsx';
import TestTopRow from './TestTopRow.tsx';
import TestResults from './TestResults.tsx';
import RandomiseStepOptionsForAllTestMoves from './testFunctions/RandomiseStepOptionsForAllMoves.ts';
import DetermineTestScore from './testFunctions/DetermineTestScore.ts';
import DetermineOptionColor, {DetermineOptionColorForResults} from './testFunctions/DetermineOptionColour.ts';
import DetermineIsFinalQuestion from './testFunctions/DetermineIsFinalQuestion.ts';
import PackageIncorrectAnswers, { AnswerPair, PackagedIncorrectAnswersObject } from './testFunctions/PackageIncorrectAnswers.ts';
import { Move, Step, TestMove, TestStep } from '../../data/types.ts';
import { useAppContext } from '../../AppContext.tsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ScaffoldMoveStepOptionsFromStepData from './testFunctions/ScaffoldMoveStepOptionsFromStepData.ts';
import { addUserLearnedMove, updateUserLearnedMoves } from '../../apiClient.ts';
import ScaffoldLearnedMovesForTempUser from './testFunctions/ScaffoldLearnedMovesForTempUser.ts';


interface TestProps {
    isReviewsArg : boolean;
    testData : TestMove[]
}

//after completing test for a lesson, need to add to the db that this is now a learnedMove

export default function Test({isReviewsArg, testData, navigationTarget}){
    const { 
        setUser,
        user,
        isMobile,
        isTempUser
    } = useAppContext();

    const navigate = useNavigate();

    const [moves, setMoves] = useState<TestMove[]>(testData);

    const [currentMove, setCurrentMove] = useState<TestMove>(testData[0]);

    const [currentStep, setCurrentStep] = useState<TestStep>(testData[0].steps[0]);

    const [correctCounter, setCorrectCounter] = useState<number>(0);
    const [totalCounter, setTotalCounter] = useState<number>(0);
    const [isFinalQuestion, setIsFinalQuestion] = useState<boolean>(false);

    const [endTest, setEndTest] = useState<boolean>(false);
    const [incorrectAnswerPairsObject, setIncorrectAnswerPairsObject] = useState<PackagedIncorrectAnswersObject>();

    const HandleNextQuestion = () => {
        const currentMoveIndex = moves.indexOf(currentMove);

        if (currentMove.steps.length === currentStep.stepNumber){
            setCurrentMove(moves[currentMoveIndex + 1]);
            setCurrentStep(moves[currentMoveIndex + 1].steps[0]);
            return;
        }
        else{
            let nextStepIndex = currentStep.stepNumber;
            setCurrentStep(currentMove.steps[nextStepIndex]);
        }
    }

    useEffect(()=> {
        if (isFinalQuestion
        ){
            const run = async () => {
                const timeout = setTimeout(() => {
                    setEndTest(true);
                }, 2000)

                if (isReviewsArg){
                    const strippedReviews = moves.map((move) => {
                        return {
                            moveId: move.id,
                            steps: move.steps.map((step) => {
                                return{
                                    isCorrect: step.isCorrect
                                }
                            })
                        }
                    })
                    const updatedUserLearnedMoves = await updateUserLearnedMoves(strippedReviews);
                    if (updatedUserLearnedMoves.length){
                        const newUser = { ...user, learnedMoves: updatedUserLearnedMoves };
                        newUser.learnedMoves = updatedUserLearnedMoves;
                        setUser(newUser);
                    }
                    //update score of user's learnedMove

                } else if (user?.learnedMoves.find(lm => lm.id === currentMove.id)){
                    return
                } else {
                    if(isTempUser){
                        //need to scaffold learnedMoves to match the type in API model
                        let newUser = JSON.parse(JSON.stringify(user));
                        const scaffoldedLearnedMovesForTempUser = ScaffoldLearnedMovesForTempUser(moves, newUser, currentMove);
                        scaffoldedLearnedMovesForTempUser.forEach((lm) => {
                            newUser.learnedMoves.push(lm)
                        })
                        
                        setUser(newUser);
                    }
                    else{
                        const newUserLearnedMoves = await addUserLearnedMove(moves[0].id, moves[0].martialArtId);
                        if (newUserLearnedMoves.length){
                            const newUser = { ...user, learnedMoves: newUserLearnedMoves };
                            newUser.learnedMoves = newUserLearnedMoves;
                            setUser(newUser);
                        }
                    }
                }
            }

            run();
        }
    }, [isFinalQuestion])

    const HandleAnswerQuestion = (optionIndex) => {
        if (endTest || currentStep.answered) return;

        const currentMoveIndex : number = moves.indexOf(currentMove);
        const currentStepIndex : number = currentStep.stepNumber -1;

        let answeredCurrentStep : TestStep = JSON.parse(JSON.stringify(currentStep));

        answeredCurrentStep.stepOptions[optionIndex].selected = true;
        answeredCurrentStep.answered = true;
        if (answeredCurrentStep.stepOptions[optionIndex].isRealStep) answeredCurrentStep.isCorrect = true
        else answeredCurrentStep.isCorrect = false
        setCurrentStep(answeredCurrentStep);

        let updatedMoves = JSON.parse(JSON.stringify(moves));
        updatedMoves[currentMoveIndex].steps[currentStepIndex] = answeredCurrentStep;

        setMoves(updatedMoves);

        setCurrentMove(updatedMoves[currentMoveIndex]);

        const updatedIsFinalQuestion : boolean = DetermineIsFinalQuestion(updatedMoves.length, currentMoveIndex,updatedMoves[currentMoveIndex].steps.length, updatedMoves[currentMoveIndex].steps[currentStepIndex]);

        if (updatedIsFinalQuestion){
            setIsFinalQuestion(updatedIsFinalQuestion);
            DetermineTestScore(updatedMoves, setTotalCounter, setCorrectCounter);
            const updatedIncorrectAnswerPairsObject : PackagedIncorrectAnswersObject = PackageIncorrectAnswers(updatedMoves);
            setIncorrectAnswerPairsObject(updatedIncorrectAnswerPairsObject);
        }
    };

    return(
        <div className='test-container dashboard-container-width dashboard-container-height' style={{marginTop: '20px'}}>
            <div className='full-width flex flex-wrap'>
                <div className='hollow-container border-color-1 clickable' style={{height: '30px', marginRight: '10px'}}>
                    <p onClick={(e)=> {
                        navigate(navigationTarget);
                    }} className="color-10 primary-font back-to-dashboard-text">
                        ← Dashboard 
                    </p>
                </div>
                {
                    
                    currentMove && currentMove.martialArtName && currentMove.name && (
                        <div className='hollow-container border-color-1' style={{height: '30px'}}>
                            <p className='color-10 primary-font back-to-dashboard-text'>{currentMove.martialArtName}: {currentMove.name}: {currentStep.stepNumber}</p>
                        </div>
                    ) 
                }
            </div>
            
                
            {
                !endTest ? (
                    <div className='full-width-and-height'>
                        {/* <TestTopRow move={currentMove} currentStep={currentStep} /> */}
                        <TestQuestions currentStep={currentStep} 
                            HandleAnswerQuestion={HandleAnswerQuestion} 
                            HandleNextQuestion={HandleNextQuestion} 
                            DetermineOptionColor={DetermineOptionColor} 
                            isFinalQuestion={isFinalQuestion}
                        />
                    </div>
                ) : (
                    <TestResults correctCounter={correctCounter} totalCounter={totalCounter} incorrectAnswerPairsObject={incorrectAnswerPairsObject} DetermineOptionColorForResults={DetermineOptionColorForResults} />
                )
            }
            
        </div>
    )
}
