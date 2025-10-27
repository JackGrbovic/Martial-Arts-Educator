import {useContext, useEffect, useState} from "react"
import { WrestlingImage, NoGiBJJImage, WrestlingMobileImage, NoGiBJJMobileImage, MobileLogiImage, MobileLogoImage } from "../../../assets/images/ImageExports.js";
import DashboardMainSectionLeftSide from "./DashboardMainSectionLeftSide.tsx";
import DashboardMainSectionRightSide from "./DashboardMainSectionRightSide/DashboardMainSectionRightSide.tsx";
import { useAppContext } from "../../../AppContext.tsx";
import LearnedSoFarPanel from "./DashboardMainSectionRightSide/LearnedSoFarPanel.tsx";
import { useNavigate } from "react-router-dom";
import UserGuide from "../../general/UserGuide.jsx";
import { LogoImage } from "../../../assets/images/ImageExports.js";

export default function DashboardMainSection({selectedMartialArtLessons, selectedMartialArt, selectedMartialArtLearnedMoves, handleSetBeginReviews, reviews}){
    const [backgroundImage, setBackgroundImage] = useState()
    const { isMobile } = useAppContext();

    const [infoPanelDisplayed, setInfoPanelDisplayed] = useState(false);
    const [showLearnedMoves, setShowLearnedMoves] = useState(false);
    const [showUserGuide, setShowUserGuide] = useState(false);

    useEffect(() => {
        determineBackgroundImage();
    }, [isMobile])

    useEffect(() => {
    }, [showLearnedMoves, showUserGuide])

    useEffect(() => {
        determineBackgroundImage();
    }, [selectedMartialArt])

    const handleDisplayInfoPanel = (panelName: string) => {
            if (panelName === 'lsf' && showLearnedMoves){
                setShowLearnedMoves(false);
                setInfoPanelDisplayed(false);
            }
            else if (panelName === 'lsf' && !showLearnedMoves){
                setShowLearnedMoves(true);
                setInfoPanelDisplayed(true);
            }
            else if (panelName === 'ug' && showUserGuide){
                setShowUserGuide(false);
                setInfoPanelDisplayed(false);
            }
            else if (panelName === 'ug' && !showUserGuide){
                setShowUserGuide(true);
                setInfoPanelDisplayed(true);
            }
        }
    
    const determineBackgroundImage = () => {
        if (selectedMartialArt.name === "Wrestling"){
            setBackgroundImage(!isMobile ? WrestlingImage : WrestlingMobileImage);
        } 
        else if (selectedMartialArt.name === "No-Gi BJJ") {
            setBackgroundImage(!isMobile ? NoGiBJJImage : NoGiBJJMobileImage);
        }
    }

    return (
        <div className={`dashboard-main-section-container color-1 ${!isMobile ? 'height-400' : 'mobile-background-container-height'} full-width`} style={{marginTop: isMobile ? '10px' : '20px'}}>
            <div className={`background-image-container ${isMobile ? 'flex-wrap flex' : ''}`} style={{backgroundImage: `url(${backgroundImage})`, padding: isMobile ? 'none' : '', justifyContent: isMobile ? 'center' : ''}}>
                {isMobile && !infoPanelDisplayed &&
                    <img src={LogoImage} style={{width: '90%', alignSelf: 'center', justifySelf: 'center'}} />
                }
                
                
                {!isMobile &&
                    <>
                        <div className={`${!isMobile ? 'left-side-inner-background-image-container' : ''}`}>
                            <img src={`${LogoImage}`} style={{maxHeight: '150px', marginTop: '5px'}} />

                            

                            {/* <div className='button-height'>
                                <div className='button background-color-1'>
                                    <p className='label color-3'>Learned</p>
                                    <div className='button-within-button background-color-3'>
                                        <p className='small-label color-1'>
                                            {selectedMartialArtLearnedMoves?.length ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='button-height'>
                                <div className='button background-color-3'>
                                    <p className='label link color-1'>To learn</p>
                                    <div className='button-within-button background-color-1'>
                                        <p className='small-label color-3'>
                                            {selectedMartialArtLessons?.length ?? 0}
                                        </p>
                                    </div>
                                </div>
                            </div> */}
                            <UserGuide showUserGuide={showUserGuide} showLearnedMoves={showLearnedMoves} handleDisplayInfoPanel={handleDisplayInfoPanel}/>
                        </div>
                        <div className={`flex ${!isMobile ? 'right-side-inner-background-image-container' : 'full-width'}`} style={{justifyContent: isMobile ? 'center' : '', width: isMobile ? '50%' : ''}}>
                            {/* <div className='hollow-container color-3 height-auto'>
                                <p className='large-title color-3'>{selectedMartialArt.name}</p>
                            </div> */}
                            <LearnedSoFarPanel countToDisplay={4} selectedMartialArtLearnedMoves={selectedMartialArtLearnedMoves} showLearnedMoves={showLearnedMoves} showUserGuide={showUserGuide} handleDisplayInfoPanel={handleDisplayInfoPanel} selectedMartialArt={selectedMartialArt}/>
                        </div>
                    </>
                }
                
                {isMobile && 
                    <>
                        {isMobile && !showLearnedMoves && !showUserGuide &&
                            <div className="flex" style={{width: '100%', justifyContent: 'space-around', marginBottom: '30px'}}>
                                <div className={`hollow-container flex border-color-6 clickable`} onClick={() => {handleDisplayInfoPanel('lsf')}} style={{width: '40%', justifyContent: 'center', marginLeft: '10px', padding: '0'}}>
                                    <p className='secondary-font color-6' style={{fontSize: '20px', textDecoration: 'underline'}}>Learned so far&nbsp;
                                        {isMobile && !showLearnedMoves && (<span>↑</span>)}
                                    </p>
                                </div>
                                
                                <div className={`hollow-container flex border-color-6 clickable`} onClick={() => {handleDisplayInfoPanel('ug')}} style={{width: '40%', justifyContent: 'center', marginRight: '10px', padding: '0'}}>
                                    <p className='secondary-font color-6' style={{fontSize: '20px', textDecoration: 'underline'}}>User Guide&nbsp;
                                        {isMobile && !showUserGuide && (<span >↑</span>)}
                                    </p>
                                </div>
                            </div>
                        }
                        
                        
                        {isMobile && showLearnedMoves && !showUserGuide &&
                            <div className="flex full-width" style={{justifyContent: 'center'}}>
                                <LearnedSoFarPanel countToDisplay={3} selectedMartialArtLessons={selectedMartialArtLessons} selectedMartialArtLearnedMoves={selectedMartialArtLearnedMoves} showLearnedMoves={showLearnedMoves} selectedMartialArt={selectedMartialArt} showUserGuide={showUserGuide} handleDisplayInfoPanel={handleDisplayInfoPanel}/>
                            </div>
                        }


                        {isMobile && showUserGuide && !showLearnedMoves &&
                            <div className="flex full-width" style={{justifyContent: 'center'}}>
                                <UserGuide showUserGuide={showUserGuide} setShowUserGuide={setShowUserGuide} showLearnedMoves={showLearnedMoves} handleDisplayInfoPanel={handleDisplayInfoPanel}/>
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    )
}
