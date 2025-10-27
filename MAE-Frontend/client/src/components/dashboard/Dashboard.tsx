import React, {useEffect, useState} from 'react';
import DashboardTopRow from './DashboardTopRow.tsx';
import DashboardMainSection from './DashboardMainSection/DashboardMainSection.tsx';
import { useAppContext } from '../../AppContext.tsx';
import { Move, MartialArt } from '../test/testFunctions/TestTestData.ts';
import { ScaffoldTestDataFromMoves } from '../test/testFunctions/ScaffoldTestDataFromIds.ts';
import Test from "../test/Test.tsx";
import { useNavigate } from 'react-router-dom';

export default function Dashboard(){
    const { 
        user,
        martialArts,
        reviews,
        loading,
        allSteps,
        isMobile
    } = useAppContext();

    const navigate = useNavigate();

    const [selectedMartialArt, setSelectedMartialArt] = useState<MartialArt | null>(martialArts ? martialArts[0] : null);
    const [selectedMartialArtLessons, setSelectedMartialArtLessons] = useState<Move[] | null>(null);
    const [selectedMartialArtLearnedMoves, setSelectedMartialArtLearnedMoves] = useState([]);
    const [constructedReviews, setConstructedReviews] = useState();
    const [selectedMartialArtReviews, setSelectedMartialArtReviews] = useState();
    const [beginReviews, setBeginReviews] = useState(false);


    useEffect(() => {
        handleSetSelectedMartialArtLessons();
    }, [])

    useEffect(() => {
        handleSetSelectedMartialArtLessons();
        handleSetSelectedMartialArtLearnedMoves();
    }, [selectedMartialArt]);

    useEffect(() => {
        reviews && constructReviewsFromMoves();
    }, [selectedMartialArtLearnedMoves, reviews]);

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
        setBeginReviews(true);
    }

    const handleSetSelectedMartialArtLessons = () => {
        if (!selectedMartialArt || !user?.learnedMoves) return;
        const learnedMoveIds = new Set(user.learnedMoves.map(lm => lm.moveId));
        const lessonsForSelectedMartialArt = selectedMartialArt.moves.filter(m => !learnedMoveIds.has(m.id));

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

    return(
        loading ? (
            <>loading...</>
        ) : !loading && !beginReviews ? (
            <div className={`dashboard-container ${isMobile ? 'mobile-dashboard-width mobile-dashboard-height' : 'dashboard-container-width'}`}>
                <DashboardTopRow selectedMartialArtReviews={selectedMartialArtReviews} selectedMartialArtLessons={selectedMartialArtLessons} reviews={selectedMartialArtReviews} selectedMartialArt={selectedMartialArt} setSelectedMartialArt={setSelectedMartialArt} handleSetBeginReviews={handleSetBeginReviews} beginReviews={beginReviews}/>
                <DashboardMainSection selectedMartialArtLessons={selectedMartialArtLessons} selectedMartialArtLearnedMoves={selectedMartialArtLearnedMoves} selectedMartialArt={selectedMartialArt} handleSetBeginReviews={handleSetBeginReviews} reviews={reviews}/>
                { isMobile && 
                    <div className="space-between-row-container full-width button-height" style={{marginTop: '10px'}}>
                        <div className={`${selectedMartialArtLessons?.length ? 'clickable' : ''} button background-color-1`} style={{width: '100%', marginRight: '5px'}} onClick={()=> {selectedMartialArtLessons[0] && navigate(`/lesson/${selectedMartialArt.id}/${selectedMartialArtLessons[0].id}`)}}>
                            <p className={`${selectedMartialArtLessons?.length > 0 ? 'clickable-text' : ''} label color-2`}>
                                Lessons
                            </p>
                            <div className='button-within-button background-color-2'>
                                <p className='small-label color-1'>
                                    {selectedMartialArtLessons?.length ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className={`${selectedMartialArtReviews?.length ? 'clickable' : ''} hollow-container color-1`} style={{width: '100%', marginLeft: '5px'}}>
                            <p className={`${selectedMartialArtReviews?.length > 0 ? 'clickable-text' : ''} label color-1 link`} onClick={handleSetBeginReviews}>
                                Reviews
                            </p>
                            <div className='button-within-button background-color-1'>
                                <p className='small-label color-2'>
                                    {selectedMartialArtReviews?.length ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        ) : !loading && beginReviews && (
            <Test testData={selectedMartialArtReviews} isReviewsArg={true} navigationTarget={0} />
        )
    )
}
