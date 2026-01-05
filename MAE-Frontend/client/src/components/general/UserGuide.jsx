import React from "react"
import { useAppContext } from "../../AppContext.tsx";

export default function UserGuide({showUserGuide, showLearnedMoves, handleDisplayInfoPanel}){
    const { isMobile } = useAppContext();

    const userGuideText = () => {
        return(
            <p className="color-10 primary-font user-guide-font-size no-margin">
                This is the Martial Arts Educator. Its primary goal is to break down often complex grappling techniques into several steps
                which the user can learn individually, and then be tested on to solidify their knowledge. 
                <br />
                <br />
                It uses a Spaced-Repitition-System (SRS), in this case, meaning that the better you score for each
                technique, the less frequently you will be tested on that technique as you're more comfortable
                with it. Converseley, the lower you score for particular techniques, the more frequently you
                will be tested on it, which will help you solidify your understanding of it.
                <br />
                <br />
                Each lesson breaks a video down into the steps that it teaches the user. 
                A description of the step is available underneath each clip, and once all steps have been gone through,
                a test begins to help the user recall the fresh information.
                <br />
                <br />
                After that, the move is added to the user's review pile. When it is time for the user to review a move,
                it will become present in the "Reviews" tab for its respective martial art.
                These will be shown to the user more or less frequently as per the SRS model described above.

                Happy learning!
            </p>
        )
    }

    return(
        <div className={`info-panel-container full-width`} style={{height: isMobile && '100%', alignItems: isMobile ? 'center' : '', width: isMobile ? '80%' : '100%'}}>
            {isMobile && showUserGuide && !showLearnedMoves &&
                <div style={{width: '100%', height: '100%', alignContent: 'center'}}>
                    <div style={{width: '100%', display: 'flex', justifyContent: 'space-between'}}>
                        <p className='primary-font color-6 info-label-font-size' style={{margin: '0px', textAlign: 'left', fontWeight: 'bold'}}>User Guide</p>
                        {isMobile && showUserGuide && (<span className="primary-font color-6 info-label-font-size clickable"  onClick={() => {handleDisplayInfoPanel('ug')}}>↓</span>)}
                    </div>
                    
                    <div className="border-radius border-color-1" style={{height: '230px', padding: '10px', border: '1px solid'}}>
                            <div className="scroll" style={{height: '230px'}}>
                                {userGuideText()}
                            </div>
                    </div>
                </div>
            }

            {!isMobile &&
                <>
                    <p className='primary-font color-10 info-label-font-size' style={{margin: '0px', textAlign: 'left'}}>User Guide</p>
                    <div className="border-radius border-color-1 border-solid faded-background" style={{height: '120px', padding: '10px'}}>
                        <div className="scroll" style={{maxHeight: '110px'}}>
                            {userGuideText()}
                        </div>
                    </div>
                </>
            }
        </div>
    )
}
