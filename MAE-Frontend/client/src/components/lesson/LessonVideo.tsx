import React, {useEffect, useState} from "react"
import rebuildUrlWithTimestamps from "./lessonFunctions/RebuildUrlWithTimestamps.ts"
import { useAppContext } from "../../AppContext.tsx"


export default function LessonVideo({url, startTime, endTime, videoHeight}){
    const { isMobile, setIframeLoaded, iframeParentSize } = useAppContext();

    useEffect(() => {
        setIframeLoaded(true);
    }, []);

    return(
        <iframe className='video' src={rebuildUrlWithTimestamps(url, startTime, endTime)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
    )
}
