const nearestFixedValue = (dest, fixedIndices, index) => {
    for(let i=fixedIndices.length-1; i >= 0; --i){
        if(index >= fixedIndices[i]) return dest[fixedIndices[i]];
    }
    return dest[fixedIndices[0]];
}

module.exports = (src, destLength) => {
    if(!src) return src;
    
    //scale from input range to output range
    const srcLength = src.length;

    const scaleIndex = srcIndex => (srcIndex / srcLength) * destLength;

    //init output array
    const dest = [...Array(destLength)].map(val => null);

    //init array that holds indices of "non-interpolated" dest values
    const fixedDestIndices = [];

    //write src values to scaled positions
    src.forEach((srcValue, srcIndex) => {
        destIndex = Math.round(scaleIndex(srcIndex));
        dest[destIndex] = srcValue;
        fixedDestIndices.push(destIndex);
    });

    //fill the gaps: use previous fixed value
    return dest.map((destValue, destIndex) => destValue !== null
        ? destValue
        : nearestFixedValue(dest, fixedDestIndices, destIndex)
    );
}