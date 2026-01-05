import React, { useEffect, useState } from "react"
import { useAppContext } from "../../AppContext.tsx"
import { useNavigate } from "react-router-dom";
import { api } from "../../apiClient.ts";
import LoginWithLink from "../../Auth/pages/LoginWithLink.tsx";

export default function DashboardTopRow({nextReviewDateTime, selectedMartialArtLessons, reviews, selectedMartialArt, setSelectedMartialArt, beginReviews, handleSetBeginReviews, selectedMartialArtReviews, redirectToRegister}){
    const { martialArts, isMobile, isTempUser, user } = useAppContext();
    const [logout, setLogout] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        martialArts && setSelectedMartialArt(martialArts[0])

    }, [martialArts]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        martialArts && setSelectedMartialArt(martialArts[index])
    }, [index]);


    useEffect(() => {
        const handleLogout = async ()=> {
            await api.post('/logout')
        }

        if(logout){
            handleLogout();
            navigate('/')
            window.location.reload();
        }
    }, [logout])

    // const handleSetMartialArtsArrayForDropdown = () => {
    //     let martialArtsForDropdownToSet = [];

    //     for (let i = 0; i < martialArts.length; i++){
    //         if (martialArts[i].id != selectedMartialArt.id){
    //             martialArtsForDropdownToSet.push(martialArts[i])
    //         }
    //     }

    //     setMartialArtsForDropdown(martialArtsForDropdownToSet);
    // }

    return(
        <div className='space-between-row-container button-height flex-wrap'>
            { !isMobile && 
                <>
                    <div className={`${selectedMartialArtLessons?.length ? 'clickable' : ''} hollow-container border-color-9 top-row-max-height`} onClick={()=> {selectedMartialArtLessons[0] && navigate(`/lesson/${selectedMartialArt.id}/${selectedMartialArtLessons[0].id}`)}}>
                        <p className={`label color-10`}>
                            Lessons
                        </p>
                        <div className='button-within-button border-color-9'>
                            <p className='small-label color-10'>
                                {selectedMartialArtLessons?.length ?? 0}
                            </p>
                        </div>
                    </div>
                        {nextReviewDateTime ? (
                            <div className={`${selectedMartialArtReviews?.length ? 'clickable' : ''} hollow-container color-6 top-row-max-height`} style={{display: 'inline-block', padding: '2px'}}>
                                <p className={'next-review-label-component label color-10'}>
                                    Next Review Date
                                </p>
                                <p className={'next-review-date-component label color-10'}>
                                    {nextReviewDateTime}
                                </p>
                            </div>
                            
                        ) : (
                                <div className={`${selectedMartialArtReviews?.length ? 'clickable' : ''} hollow-container color-1 top-row-max-height`}>
                                    <p className={`label color-10`} onClick={isTempUser ? redirectToRegister : handleSetBeginReviews}>
                                        Reviews
                                    </p>
                                    <div className='button-within-button border-color-1 '>
                                        <p className='small-label color-10   '>
                                            {reviews?.length ?? 0}
                                        </p>
                                    </div>
                                </div>
                                
                            )
                        }
                        
                </>
            }
            
            <div className="dropdown top-row-max-height" style={{}}>
                <div id="#dbtr-ma-container" className='hollow-container color-1 dbtr-container top-of-dropdown clickable'>
                    <p className='label full-width color-10'>
                        {selectedMartialArt?.name}
                    </p>
                </div>
                {<div className="dropdown-content">
                    {selectedMartialArt && martialArts && martialArts.length && martialArts.map((martialArt, key) => {
                        let elementToReturn;
                        
                        if (martialArt.id != selectedMartialArt.id) elementToReturn = <div id="#dbtr-ma-container" className={`hollow-container color-1 dbtr-container ${key == martialArts.length-1 && 'bottom-of-dropdown'} clickable`} onClick={() => {setIndex(key)}}>
                                    <p className='label full-width color-10'>
                                        {martialArt?.name}
                                    </p>
                                </div>;

                        else elementToReturn = <></>;
                        return elementToReturn;
                    })}
                </div>}
            </div>

            <div className="hollow-container color-1 username-container top-row-max-height">
                <p className="label username-label color-10">
                    U:{user?.userName}
                </p>
            </div>
            
            <div id="dbtr-logout-container" className='hollow-container color-9 dbtr-container clickable top-row-max-height'>
                {isTempUser ? (
                        <p className='small-label color-10' onClick={() => {navigate('/login-link-request')}}>
                            Log In
                        </p>
                ) : (
                        <p className='small-label color-10' onClick={() => {setLogout(true)}}>
                            Log Out
                        </p>
                )}
            </div>
            
            
        </div>
    )
}
