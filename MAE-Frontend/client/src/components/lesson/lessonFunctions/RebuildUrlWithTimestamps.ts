export default function rebuildUrlWithTimestamps(url : string, startTime : number, endTime : number){
    return `${changeUrlType(url)}?start=${startTime}&end=${endTime}`;
}

function changeUrlType(url: string){
    const watch = 'watch?v=';
    const embed = 'embed/';

    let newArray = url.split(watch);
    return newArray.join(embed).toString();
}