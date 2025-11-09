import React, { useEffect, useState } from "react"
import { useAppContext } from "../../AppContext.tsx"
import { useNavigate } from "react-router-dom";
import { api } from "../../apiClient.ts";

export default function DashboardTopRow({selectedMartialArtLessons, reviews, selectedMartialArt, setSelectedMartialArt, beginReviews, handleSetBeginReviews, selectedMartialArtReviews}){
    const { martialArts, isMobile } = useAppContext();
    const [logout, setLogout] = useState(false);
    const navigate = useNavigate();

    console.log("selectedMartialArt", selectedMartialArt);
    console.log("martialArts", martialArts);

    useEffect(() => {
        martialArts && setSelectedMartialArt(martialArts[0])
    }, [martialArts]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        martialArts && setSelectedMartialArt(martialArts[index])
    }, [index]);


    const handleSetMartialArt = (direction) => {
        if (!martialArts) return;

        if (martialArts?.length < 2) {
            return;
        }
        
        else if (direction === "left" && selectedMartialArt.id === martialArts[0].id){
            setIndex(martialArts.length-1);
            return;
        }

        else if (direction === "right" && selectedMartialArt === martialArts[martialArts.length-1]){
            setIndex(0);
            return;
        }

        else if (direction === "right"){
            const newIndex = JSON.parse(JSON.stringify(index));
            setIndex(newIndex + 1)
            return;
        }
        else if (direction === "left"){
            const newIndex = JSON.parse(JSON.stringify(index));
            setIndex(newIndex - 1)
            return;
        }
    }

    useEffect(() => {
        const handleLogout = async ()=> {
            await api.post('/logout')
        }

        if(logout){
            handleLogout();
            navigate('/login')
        }
    }, [logout])


    return(
        <div className='space-between-row-container button-height flex-wrap'>
            { !isMobile && 
                <>
                    <div className={`${selectedMartialArtLessons?.length ? 'clickable' : ''} button background-color-1`} onClick={()=> {selectedMartialArtLessons[0] && navigate(`/lesson/${selectedMartialArt.id}/${selectedMartialArtLessons[0].id}`)}}>
                        <p className={`${selectedMartialArtLessons?.length ? 'clickable-text' : ''} label color-2`}>
                            Lessons
                        </p>
                        <div className='button-within-button background-color-2'>
                            <p className='small-label color-1'>
                                {selectedMartialArtLessons?.length ?? 0}
                            </p>
                        </div>
                    </div>
                    <div className={`${selectedMartialArtReviews?.length ? 'clickable' : ''} hollow-container color-1`}>
                        <p className={`${selectedMartialArtReviews?.length ? 'clickable-text' : ''} label color-1`} onClick={handleSetBeginReviews}>
                            Reviews
                        </p>
                        <div className='button-within-button background-color-1'>
                            <p className='small-label color-2'>
                                {reviews?.length ?? 0}
                            </p>
                        </div>
                    </div>
                </>
            }
            <div className='chevron-button-container button-height dbtr-container'>
                <button onClick={() => {handleSetMartialArt("left")}} className='remove-button-style left-only-radius chevron-selector-button-left hollow-container color-1 border-color-1'>
                    <p className='chevron color-1'>&lt;</p>
                </button>
                <button onClick={() => {handleSetMartialArt("right")}} className='remove-button-style right-only-radius chevron-selector-button-right hollow-container color-1 border-color-1'>
                    <p className='chevron color-1'>&gt;</p>
                </button>
            </div>
            <div id="#dbtr-ma-container" className='hollow-container color-1 dbtr-container'>
                <p className='medium-title full-width'>
                    {selectedMartialArt?.name}
                </p>
            </div>
            <div id="dbtr-logout-container" className='hollow-container color-1 dbtr-container'>
                <div className='button-within-button background-color-1 clickable' style={{margin: 'auto'}} onClick={() => {setLogout(true)}}>
                    <p className='small-label clickable-text color-2'>
                        Log Out
                    </p>
                </div>
            </div>
            
            
        </div>
    )
}
