import {useContext, useEffect, useState} from "react"
import { WrestlingImage, NoGiBJJImage, WrestlingMobileImage, NoGiBJJMobileImage, MobileLogiImage, MobileLogoImage } from "../../../assets/images/ImageExports.js";
import DashboardMainSectionLeftSide from "./DashboardMainSectionLeftSide.tsx";
import DashboardMainSectionRightSide from "./DashboardMainSectionRightSide/DashboardMainSectionRightSide.tsx";
import { useAppContext } from "../../../AppContext.tsx";
import LearnedSoFarPanel from "./DashboardMainSectionRightSide/LearnedSoFarPanel.tsx";
import { useNavigate } from "react-router-dom";
import UserGuide from "../../general/UserGuide.jsx";
import { LogoImage, MAEDesktopBottomLogo, MAEDesktopTopLogo } from "../../../assets/images/ImageExports.js";

export default function DashboardMainSection({selectedMartialArtLessons, selectedMartialArt, selectedMartialArtLearnedMoves, handleSetBeginReviews, reviews}){
    const [backgroundImage, setBackgroundImage] = useState()
    const { isMobile } = useAppContext();

    const [infoPanelDisplayed, setInfoPanelDisplayed] = useState(false);
    const [showLearnedMoves, setShowLearnedMoves] = useState(false);
    const [showUserGuide, setShowUserGuide] = useState(false);

    useEffect(() => {
        selectedMartialArt && determineBackgroundImage(selectedMartialArt);
    }, [isMobile, selectedMartialArt])

    useEffect(() => {
    }, [showLearnedMoves, showUserGuide])

    useEffect(() => {
        selectedMartialArt && determineBackgroundImage(selectedMartialArt);
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
    
    const determineBackgroundImage = (selectedMartialArt) => {
        if (selectedMartialArt.name === "Wrestling"){
            setBackgroundImage(!isMobile ? WrestlingImage : WrestlingMobileImage);
        } 
        else if (selectedMartialArt.name === "No-Gi BJJ") {
            setBackgroundImage(!isMobile ? NoGiBJJImage : NoGiBJJMobileImage);
        }
    }

    return (
        <div className={`dashboard-main-section-container color-9 ${!isMobile ? 'height-400' : 'mobile-background-container-height'} full-width`} style={{marginTop: isMobile ? '10px' : '20px'}}>
            <div className={`background-image-container ${isMobile ? 'flex-wrap flex' : ''}`} style={{/*backgroundImage: `url(${backgroundImage})`,*/ padding: isMobile ? 'none' : '', justifyContent: isMobile ? 'center' : ''}}>
                {!isMobile &&
                    <>
                        <div className={`${!isMobile ? 'left-side-inner-background-image-container' : ''}`}>
                            <div className="logo-image-container-top border-color-9">
                                <p className="logo-title">Martial Arts Educator</p>
                            </div>
                            <div className="logo-image-container-bottom border-color-9">
                                <img src={`${MAEDesktopBottomLogo}`} style={{maxHeight: '90%', marginTop: '5px', maxWidth: '100%'}} />
                            </div>
                            <span style={{marginBottom: '10px'}}></span>
                            <UserGuide showUserGuide={showUserGuide} showLearnedMoves={showLearnedMoves} handleDisplayInfoPanel={handleDisplayInfoPanel}/>
                        </div>
                        <div className={`flex ${!isMobile ? 'right-side-inner-background-image-container' : 'full-width'}`} style={{justifyContent: isMobile ? 'center' : '', width: isMobile ? '50%' : ''}}>
                            <LearnedSoFarPanel countToDisplay={4} selectedMartialArtLearnedMoves={selectedMartialArtLearnedMoves} showLearnedMoves={showLearnedMoves} showUserGuide={showUserGuide} handleDisplayInfoPanel={handleDisplayInfoPanel} selectedMartialArt={selectedMartialArt}/>
                        </div>
                    </>
                }
                
                {isMobile && !infoPanelDisplayed &&
                    <>
                        <div className="logo-image-container-top border-color-9">
                            <p className="logo-title">Martial Arts Educator</p>
                        </div>
                        <div className="logo-image-container-bottom border-color-9">
                            <img src={`${MAEDesktopBottomLogo}`} style={{maxHeight: '90%', margin: '20px 0 20px 0', maxWidth: '100%'}} />
                        </div>
                    </>
                }

                {isMobile && 
                    <>
                        {isMobile && !showLearnedMoves && !showUserGuide &&
                            <div className="flex mobile-uglm-container" style={{width: '100%', justifyContent: 'space-between'}}>
                                <div className={`hollow-container flex border-color-6 clickable`} onClick={() => {handleDisplayInfoPanel('lsf')}} style={{width: '49%', justifyContent: 'center', padding: '0'}}>
                                    <p className='primary-font color-6' style={{fontSize: '18px', textDecoration: 'underline'}}>Learned so far&nbsp;
                                        {isMobile && !showLearnedMoves && (<span>↑</span>)}
                                    </p>
                                </div>
                                
                                <div className={`hollow-container flex border-color-6 clickable`} onClick={() => {handleDisplayInfoPanel('ug')}} style={{width: '49%', justifyContent: 'center', padding: '0'}}>
                                    <p className='primary-font color-6' style={{fontSize: '18px', textDecoration: 'underline'}}>User Guide&nbsp;
                                        {isMobile && !showUserGuide && (<span >↑</span>)}
                                    </p>
                                </div>
                            </div>
                        }
                        
                        
                        {isMobile && showLearnedMoves && !showUserGuide &&
                            <div className="flex full-width" style={{justifyContent: 'center', alignSelf: 'center'}}>
                                <LearnedSoFarPanel countToDisplay={3} selectedMartialArtLessons={selectedMartialArtLessons} selectedMartialArtLearnedMoves={selectedMartialArtLearnedMoves} showLearnedMoves={showLearnedMoves} selectedMartialArt={selectedMartialArt} showUserGuide={showUserGuide} handleDisplayInfoPanel={handleDisplayInfoPanel}/>
                            </div>
                        }


                        {isMobile && showUserGuide && !showLearnedMoves &&
                            <div className="flex full-width" style={{justifyContent: 'center', alignSelf: 'center'}}>
                                <UserGuide showUserGuide={showUserGuide} setShowUserGuide={setShowUserGuide} showLearnedMoves={showLearnedMoves} handleDisplayInfoPanel={handleDisplayInfoPanel}/>
                            </div>
                        }
                    </>
                }
            </div>
        </div>
    )
}
