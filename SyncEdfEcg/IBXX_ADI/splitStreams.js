module.exports = streams => {
    const markerStream = streams['matlab'];
    if(!markerStream){
        console.warn("No matlab stream exists.");
        return [ streams ];
    }

    //read indices of markers
    const markerIndices = [
        ...markerStream.reduce((indices, value, i) => {
            if(+value > 4.5){
                indices.push(i);
            }
            return indices;
        }, []), 
        markerStream.length
    ];
    const numSegments = markerIndices.length;
    
    //read stream titles, exclude matlab stream for output
    const streamTitles = Object.keys(streams).filter(title => title !== 'matlab');
    
    //Initialize stream segments (each segment has the same structure as a streams object)
    const segments = [...Array(numSegments)].map(o => 
        streamTitles.reduce((segment, streamTitle) => {
            segment[streamTitle] = [];
            return segment;
        }, ({}))
    );
    
    //split streams into segments
    streamTitles.forEach(streamTitle => {
        const stream = streams[streamTitle];
        stream.forEach((value, i) => {
            for(let segmentIndex=0; segmentIndex<numSegments; ++segmentIndex){
                const markerIndex = markerIndices[segmentIndex];
                if(i < markerIndex){
                    segments[segmentIndex][streamTitle].push(value);
                    break;
                }
            }
        });
    });

    return segments;
}