import React, {useEffect, useState} from "react"
import rebuildUrlWithTimestamps from "./lessonFunctions/RebuildUrlWithTimestamps.ts"
import { useAppContext } from "../../AppContext.tsx"


export default function LessonVideo({url, startTime, endTime, videoHeight}){
    const { iframeParentSize, isMobile, setIframeLoaded } = useAppContext();

    useEffect(() => {
        setIframeLoaded(true);
    }, []);

    return(
        <iframe width={iframeParentSize[0]} style={{height: videoHeight}} className='video' height={videoHeight} src={rebuildUrlWithTimestamps(url, startTime, endTime)} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
    )
}
