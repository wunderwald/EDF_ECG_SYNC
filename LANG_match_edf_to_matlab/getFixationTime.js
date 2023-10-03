const fixationTimeNull = {
    fixationDuration_s: 0,
    stimulusDuration_s: 0,
    fixationPercent: 0,
    recordingIncludesEndMarker: undefined
};


const getFixationTime = (fixations, trialIndex) => {
    const fixationsOfTrial = fixations.filter(fixation => fixation.trialIndex === trialIndex);
    if(fixationsOfTrial.length < 1){
        console.warn(`⚠️  No fixations found for trial ${trialIndex}.`);
        return fixationTimeNull;
    }

    // find fixation that includes start marker
    const startFixation = fixationsOfTrial.find(fixation => fixation.messages.includes('STIMULUS_START'))
        || fixationsOfTrial.find(fixation => +fixation.fixationIndex === 1);

    //find fixation that includes end marker
    const endFixation = fixationsOfTrial.find(fixation => fixation.messages.includes('STIMULUS_END')) 
        || fixationsOfTrial.find(fixation => fixation.fixationIndex === Math.max(...fixationsOfTrial.map(fix => fix.fixationIndex)));


    //find fixations between start/end fixations
    const innerFixations = fixationsOfTrial.filter(fixation => fixation.fixationIndex > startFixation.fixationIndex && fixation.fixationIndex < endFixation.fixationIndex);

    //calc durations of start / inner / end fixations
    const startMessageIndex = startFixation.messages.indexOf('STIMULUS_START');
    const startMessageTime = startMessageIndex === -1 ? -1 : startFixation.messageTimes[startMessageIndex];
    const startFixationDuration = startMessageTime === -1
        ? startFixation.duration
        : startFixation.duration - (startMessageTime - startFixation.startTime);

    const endMessageIndex = endFixation.messages.indexOf('STIMULUS_END');
    const endMessageTime = endMessageIndex === -1 ? -1 : endFixation.messageTimes[endMessageIndex];
    const endFixationDuration = endMessageTime === -1 
        ? endFixation.duration 
        : endFixation.duration - (endFixation.endTime - endMessageTime);

    const innerFixationsDuration = innerFixations
        .map(fixation => fixation.duration)
        .reduce((sum, duration) => sum + duration, 0);
    
    const totalFixationDuration = startFixationDuration + innerFixationsDuration + endFixationDuration;

    //calc stimulus duration & fixation percentage
    const stimulusStartTime = startMessageTime;
    const stimulusEndTime = endMessageTime !== -1 ? endMessageTime : endFixation.endTime;
    const stimulusDuration = stimulusEndTime - stimulusStartTime;
    const fixationPercent = totalFixationDuration / stimulusDuration * 100;

    //check markers
    const recordingIncludesStartMarker = startMessageIndex !== -1;
    const recordingIncludesEndMarker = endMessageIndex !== -1;
    !recordingIncludesStartMarker && console.warn(`⚠️  No start marker found for trial ${trialIndex}`);
    !recordingIncludesEndMarker && console.warn(`⚠️  No end marker found for trial ${trialIndex}`);

    return {
        fixationDuration_s: totalFixationDuration / 1000,
        stimulusDuration_s: stimulusDuration / 1000,
        fixationPercent: fixationPercent,
        recordingIncludesStartMarker,
        recordingIncludesEndMarker
    };
};

module.exports = getFixationTime;