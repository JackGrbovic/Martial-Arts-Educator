import React, { useState, useEffect } from "react"
import { Move } from "../../../test/testFunctions/TestTestData";
import { useAppContext } from "../../../../AppContext.tsx";
import { useNavigate } from "react-router-dom";

export default function LearnedSoFarPanel({selectedMartialArtLessons, selectedMartialArtLearnedMoves, handleDisplayInfoPanel, showUserGuide, showLearnedMoves, selectedMartialArt, countToDisplay}){
    const { loading, isMobile } = useAppContext();

    const navigate = useNavigate();

    const [movesToDisplay, setMovesToDisplay] = useState<Move[]>([]);
    const [currentSelectionStartingNumber, setCurrentSelectionStartingNumber] = useState<number>(0);
    const [numberOfMovesToDisplayPerPage] = useState<number>(countToDisplay)
    const [remainder, setRemainder] = useState<number>(0);
    const [resetMovesToDisplay, setResetMovesToDisplay] = useState();

    const handlePagination = (direction) => {
        if (direction === 'left' && currentSelectionStartingNumber === 0) {
            return;
        }

        else if (direction === 'right' && currentSelectionStartingNumber === selectedMartialArtLearnedMoves.length) {
            return;
        }

        else if (direction === 'right' && numberOfMovesToDisplayPerPage >= selectedMartialArtLearnedMoves.length) {
            return;
        }

        else if (direction === 'left'){
            if (currentSelectionStartingNumber === 0) return;
            let newSelectionStartingNumber = 0; 
            
            if (remainder && remainder > 0){
                newSelectionStartingNumber = currentSelectionStartingNumber - numberOfMovesToDisplayPerPage;
            }
            else {
                newSelectionStartingNumber = currentSelectionStartingNumber - numberOfMovesToDisplayPerPage;
            }


            //if there is a remainder, subtract the remainder, then subtract numberOfMovesToDisplayPerPage from currentSelectionStartingNumber
            
            setRemainder(0);
            setCurrentSelectionStartingNumber(newSelectionStartingNumber);
            setResetMovesToDisplay(true);
        }
        else if (direction === 'right'){
            const newSelectionStartingNumber = getNewSelectionStartingNumber();

            setCurrentSelectionStartingNumber(newSelectionStartingNumber);

            const multiplier = Math.floor(newSelectionStartingNumber / numberOfMovesToDisplayPerPage);
            const numberOfMovesToDisplayPerPageCeiling = multiplier * numberOfMovesToDisplayPerPage + numberOfMovesToDisplayPerPage;
            const setRemainderFlag = selectedMartialArtLearnedMoves.length >= newSelectionStartingNumber
                && selectedMartialArtLearnedMoves.length < numberOfMovesToDisplayPerPageCeiling ? true : false;

            if (setRemainderFlag){
                const newRemainder = selectedMartialArtLearnedMoves.length % numberOfMovesToDisplayPerPage;
                setRemainder(newRemainder);
            }
            setResetMovesToDisplay(true);
        }
    }

    const getNewSelectionStartingNumber = () => {
        const provisionalNewSelectionStartingNumber = JSON.parse(JSON.stringify(currentSelectionStartingNumber)) + numberOfMovesToDisplayPerPage;

        let newSelectionStartingNumber;
        if (provisionalNewSelectionStartingNumber + numberOfMovesToDisplayPerPage > selectedMartialArtLearnedMoves.length){
            const tempRemainder = selectedMartialArtLearnedMoves.length % numberOfMovesToDisplayPerPage;
            const numberOfPages = (selectedMartialArtLearnedMoves.length - tempRemainder) / numberOfMovesToDisplayPerPage;
            newSelectionStartingNumber = (numberOfPages * numberOfMovesToDisplayPerPage);
        }
        else {
            newSelectionStartingNumber = provisionalNewSelectionStartingNumber;
        }
        return newSelectionStartingNumber;
    };

    const handleSetMovesToDisplay = () => {
        let newMovesToDisplay = [];

        if (numberOfMovesToDisplayPerPage > selectedMartialArtLearnedMoves.length){
            for (let i = currentSelectionStartingNumber; i < selectedMartialArtLearnedMoves.length; i++){
                selectedMartialArtLearnedMoves[i] && newMovesToDisplay.push(selectedMartialArtLearnedMoves[i]);
            }
        }

        else if (remainder === 0){
            for (let i = currentSelectionStartingNumber; i < numberOfMovesToDisplayPerPage; i++){
                selectedMartialArtLearnedMoves[i] && newMovesToDisplay.push(selectedMartialArtLearnedMoves[i]);
            }
        }

        else {
            for (let i = currentSelectionStartingNumber; i < currentSelectionStartingNumber + remainder; i++){
                selectedMartialArtLearnedMoves[i] && newMovesToDisplay.push(selectedMartialArtLearnedMoves[i]);
            }
        }

        setMovesToDisplay(newMovesToDisplay)
    }

    function LearnedSoFarInfoPanel(){
        return(
            <div className={`hollow-container color-1 info-panel faded-background`} style={{height: 'auto', width: isMobile && '270px'}}>
                    {!isMobile &&
                        <p className='no-margin text-align-center color-10 learned-so-far-font-size primary-font bold clickable' style={{marginBottom: '20px'}}>
                            Learned so far
                        </p>
                    }
                    {isMobile &&
                        <p className='only-margin-top text-align-center color-3 learned-so-far-font-size primary-font clickable'>Learned so far&nbsp;
                            {isMobile && showLearnedMoves && (<span onClick={() => {handleDisplayInfoPanel('lsf')}}>↓</span>)}
                        </p>
                    }
                    {movesToDisplay.length > 0 ? (
                        movesToDisplay.map((move) => (
                        <button onClick={()=> {navigate(`/lesson/${selectedMartialArt.id}/${move.id}`)}} className='hollow-container button learned-so-far-option flex-end clickable border-color-8' key={move.id} style={{background: 'none'}}>
                            <p className='small-label color-10'>{move.shortName ?? move.name}</p>
                            <div className='small-button-within-button border-solid border-color-8'>
                            <p className='small-label color-10'>✓</p>
                            </div>
                        </button>
                        ))
                    ) : (
                        <RenderFillerMoves />  
                    )}
                    {remainder ? (<RenderFillerMoves />) : <></>}

                    
                    <div className='space-between-row-container'>
                        <div className='hollow-container color-8'>
                            <p className='small-label color-10'>{ selectedMartialArtLearnedMoves?.length < numberOfMovesToDisplayPerPage || remainder ? selectedMartialArtLearnedMoves?.length : currentSelectionStartingNumber + numberOfMovesToDisplayPerPage} / {selectedMartialArtLearnedMoves?.length ?? 0}</p>
                        </div>
                        <div className='button-height'>
                            <div className='chevron-button-container button-height'>
                                <button onClick={() => {handlePagination("left")}} className='remove-button-style left-only-radius chevron-selector-button-left hollow-container color-8'>
                                    <p className='chevron color-10'>&lt;</p>
                                </button>
                                <button onClick={() => {handlePagination("right")}} className='remove-button-style right-only-radius chevron-selector-button-right hollow-container color-8'>
                                    <p className='chevron color-10'>&gt;</p>
                                </button>
                            </div>
                        </div>
                    </div>
                
                </div>
        )
    }

    function RenderFillerMoves(){
        function fillerMove(){
            return(
                <div className='hollow-container button learned-so-far-option border-color-7'>
                    <p className="color-10 text-align-center full-width small-label filler-move white-space-nowrap" style={{fontSize: '13px'}} data-fulltext="EMPTY SLOT">エンテイースロット</p>
                </div>
            )
        }

        const fillerMoveCount = numberOfMovesToDisplayPerPage - remainder;

        let fillerMoves = [];

        for (let i = 0; i < fillerMoveCount; i++){
            fillerMoves.push(fillerMove());
        }


        return(
            <>
                {fillerMoves.map((fm) => {
                    return fm
                })}
            </>
            
        )
    }


    useEffect(() => {
        //might need this to be called after setCurrentSelectionStartingNumber
        handleInitialiseRemainder();
        setCurrentSelectionStartingNumber(0);
    }, [selectedMartialArtLearnedMoves]);

    useEffect(() => {
        if (resetMovesToDisplay === true){
            setResetMovesToDisplay(false);
            handleSetMovesToDisplay();
        }
    }, [resetMovesToDisplay]);

    useEffect(() => {
        handleInitialiseRemainder();
    }, [loading]);


    const handleInitialiseRemainder = () => {
        setRemainder(selectedMartialArtLearnedMoves.length < numberOfMovesToDisplayPerPage ? selectedMartialArtLearnedMoves.length % numberOfMovesToDisplayPerPage : 0);
        setResetMovesToDisplay(true);
    }


    return(
        <div className={`info-panel-container self-flex-end ${isMobile ? 'full-width flex full-height' : 'width-50'}`} style={{width: isMobile && '90%', alignItems: isMobile ? 'center' : ''}}>
            
            
            {!isMobile && 
                <LearnedSoFarInfoPanel selectedMartialArt={selectedMartialArt} selectedMartialArtLessons={selectedMartialArtLessons}/>
            }

            {showLearnedMoves && !showUserGuide && isMobile &&
                <LearnedSoFarInfoPanel selectedMartialArt={selectedMartialArt} selectedMartialArtLessons={selectedMartialArtLessons}/>
            }
        </div>
    )
}

