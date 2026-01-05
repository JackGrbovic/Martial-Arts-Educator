import React, {useEffect, useState} from 'react';
import DashboardTopRow from './DashboardTopRow.tsx';
import DashboardMainSection from './DashboardMainSection/DashboardMainSection.tsx';
import { useAppContext } from '../../AppContext.tsx';
import { Move, MartialArt } from '../test/testFunctions/TestTestData.ts';
import { ScaffoldTestDataFromMoves } from '../test/testFunctions/ScaffoldTestDataFromIds.ts';
import Test from "../test/Test.tsx";
import { useNavigate } from 'react-router-dom';
import { LearnedMove } from '../../data/types.ts';

export default function Dashboard(){
    const { 
        user,
        martialArts,
        reviews,
        loading,
        allSteps,
        isMobile,
        isTempUser
    } = useAppContext();

    const navigate = useNavigate();

    const [selectedMartialArt, setSelectedMartialArt] = useState<MartialArt | null>(martialArts ? martialArts[0] : null);
    const [selectedMartialArtLessons, setSelectedMartialArtLessons] = useState<Move[] | null>(null);
    const [selectedMartialArtLearnedMoves, setSelectedMartialArtLearnedMoves] = useState([]);
    const [constructedReviews, setConstructedReviews] = useState();
    const [selectedMartialArtReviews, setSelectedMartialArtReviews] = useState();
    const [beginReviews, setBeginReviews] = useState(false);
    const [nextReviewDateTime, setNextReviewDateTime] = useState<String | null>();

    useEffect(() => {
        handleSetSelectedMartialArtLessons();
    }, [])

    useEffect(() => {
        if (selectedMartialArtReviews || !selectedMartialArtLearnedMoves || selectedMartialArtLearnedMoves && selectedMartialArtLearnedMoves.length < 1){
            setNextReviewDateTime(null);
            return
        }

        let learnedMoveDateTimes; 
        
        if (user && selectedMartialArt && selectedMartialArt.id){
            learnedMoveDateTimes = user.learnedMoves.filter(lm => lm.martialArtId == selectedMartialArt.id).map((lm) => {
                return new Date(lm.nextReviewDate).getTime();
            })
        }

        if (!learnedMoveDateTimes){
            console.log('learnedMoveDateTimes fail', learnedMoveDateTimes)
            setNextReviewDateTime(null)
            return
        }

        else if (selectedMartialArtLearnedMoves.length != 0){
            const learnedMovesOrderedByLowestDateTime = learnedMoveDateTimes.sort((a, b) => a < b);
            const nextReviewDateTime = new Date(learnedMovesOrderedByLowestDateTime[0]);
            const nextReviewDateTimeLocalString = nextReviewDateTime.toLocaleString('en-GB', {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
            setNextReviewDateTime(nextReviewDateTimeLocalString);
        }
    }, [selectedMartialArtLearnedMoves])

    useEffect(() => {
        handleSetSelectedMartialArtLessons();
        handleSetSelectedMartialArtLearnedMoves();
    }, [selectedMartialArt]);

    useEffect(() => {
        reviews && martialArts && selectedMartialArt && constructReviewsFromMoves();
    }, [selectedMartialArtLearnedMoves, reviews, martialArts]);

    useEffect(() => {
        constructedReviews && handleSetSelectedMartialArtReviews();
    }, [constructedReviews]);


    const constructReviewsFromMoves = () => {
        const movesFromReviews : Move[] = [];
        for (let martialArt of martialArts){
            for (let move of martialArt.moves){
                if (reviews.find(r => r.moveId === move.id)){
                    movesFromReviews.push(move)
                }
            }
        }

        //figure out how to use allMoves with below map function

        const partiallyScaffoldedSelectedMartialArtReviews = reviews.map((r) => {
            const moveObjectsToScaffoldReviews : Move[] = movesFromReviews.find(m => m.id === r.moveId);
            let scaffoldedSelectedMartialArtReview;
            if (moveObjectsToScaffoldReviews){
                scaffoldedSelectedMartialArtReview = moveObjectsToScaffoldReviews;
                scaffoldedSelectedMartialArtReview.easeFactor = r.easeFactor;
                scaffoldedSelectedMartialArtReview.reviewId = r.id;
                scaffoldedSelectedMartialArtReview.steps = allSteps.filter(step => step.moveId === scaffoldedSelectedMartialArtReview.id);
                scaffoldedSelectedMartialArtReview.moveId = moveObjectsToScaffoldReviews.id;
            } 
            if (scaffoldedSelectedMartialArtReview) return scaffoldedSelectedMartialArtReview;
        });

        const scaffoldedTestDataFromMoves = ScaffoldTestDataFromMoves(partiallyScaffoldedSelectedMartialArtReviews, allSteps, martialArts)

        scaffoldedTestDataFromMoves && setConstructedReviews(scaffoldedTestDataFromMoves);

        const newSelectedMartialArtReviews = scaffoldedTestDataFromMoves.filter(r => r.martialArtId === selectedMartialArt.id);

        setSelectedMartialArtReviews(newSelectedMartialArtReviews);
    };

    const handleSetSelectedMartialArtReviews = () => {
        const newSelectedMartialArtReviews = constructedReviews.filter(r => r.martialArtId === selectedMartialArt.id);

        setSelectedMartialArtReviews(newSelectedMartialArtReviews);
    };

    const handleSetBeginReviews = () => {
        selectedMartialArtReviews.length > 0 && setBeginReviews(true);
    }

    const handleSetSelectedMartialArtLessons = () => {
        if (!selectedMartialArt || !user?.learnedMoves) return;
        const userLearnedMoves = JSON.parse(JSON.stringify(user.learnedMoves))
        
        const learnedMoveIds = new Set(user.learnedMoves.map(lm => lm.moveId));
        const lessonsForSelectedMartialArt = selectedMartialArt.moves.filter(m => {
            if (!learnedMoveIds.has(m.id)){
                return m
            }
        })

        setSelectedMartialArtLessons(lessonsForSelectedMartialArt)
    }

    const handleSetSelectedMartialArtLearnedMoves = () => {
        if (!selectedMartialArt || !user?.learnedMoves) return;
        const movesThatHaveBeenLearned: Move[] = selectedMartialArt.moves.filter((move) => {
            const moveThatHasBeenLearned = user.learnedMoves.find(lm => lm.moveId === move.id);
            if (moveThatHasBeenLearned) return moveThatHasBeenLearned
        });

        movesThatHaveBeenLearned && setSelectedMartialArtLearnedMoves(movesThatHaveBeenLearned);
    }

    const redirectToRegister = () => {
        navigate('/register');
    }

    return(
        loading ? (
            <>loading...</>
        ) : !loading && !beginReviews ? (
            <div className={`dashboard-container dashboard-container-width dashboard-container-height`}>
                <DashboardTopRow nextReviewDateTime={nextReviewDateTime} selectedMartialArtReviews={selectedMartialArtReviews} selectedMartialArtLessons={selectedMartialArtLessons} reviews={selectedMartialArtReviews} selectedMartialArt={selectedMartialArt} setSelectedMartialArt={setSelectedMartialArt} handleSetBeginReviews={handleSetBeginReviews} beginReviews={beginReviews} redirectToRegister={redirectToRegister} />
                <DashboardMainSection selectedMartialArtLessons={selectedMartialArtLessons} selectedMartialArtLearnedMoves={selectedMartialArtLearnedMoves} selectedMartialArt={selectedMartialArt} handleSetBeginReviews={handleSetBeginReviews} reviews={reviews}/>
                { isMobile && 
                    <div className="space-between-row-container full-width button-height" style={{marginTop: '10px'}}>
                        <div className={`${selectedMartialArtLessons?.length ? 'clickable' : ''} button border-color-1 border-solid`} style={{width: '50%', marginRight: '5px'}} onClick={()=> {selectedMartialArtLessons[0] && navigate(`/lesson/${selectedMartialArt.id}/${selectedMartialArtLessons[0].id}`)}}>
                            <p className={`label color-10`}>
                                Lessons
                            </p>
                            <div className='button-within-button background-color-2'>
                                <p className='small-label color-10'>
                                    {selectedMartialArtLessons?.length ?? 0}
                                </p>
                            </div>
                        </div>
                        {nextReviewDateTime ? (
                            <div className={`${selectedMartialArtReviews?.length ? 'clickable' : ''} hollow-container color-6 top-row-max-height`} style={{display: 'inline-block', padding: '2px', width: '50%', marginLeft: '5px'}}>
                                <p className={'next-review-label-component label color-10'}>
                                    Next Review Date
                                </p>
                                <p className={'next-review-date-component label color-10'}>
                                    {nextReviewDateTime}
                                </p>
                            </div>
                            
                        ) : (
                                <div className={`${selectedMartialArtReviews?.length ? 'clickable' : ''} hollow-container color-1 top-row-max-height`} style={{width: '50%', marginLeft: '5px'}}>
                                    <p className={`label color-10`} onClick={isTempUser ? redirectToRegister : handleSetBeginReviews}>
                                        Reviews
                                    </p>
                                    <div className='button-within-button border-color-1'>
                                        <p className='small-label color-10'>
                                            {reviews?.length ?? 0}
                                        </p>
                                    </div>
                                </div>
                                
                            )
                        }
                    </div>
                }
            </div>
        ) : !loading && beginReviews && (
            <Test testData={selectedMartialArtReviews} isReviewsArg={true} navigationTarget={0} />
        )
    )
}
