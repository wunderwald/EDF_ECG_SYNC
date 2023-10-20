export const mergeTriggerTimes = ({ trialData, labchartData }) => {
    // convert trial data to array of objects { absTime [utc numeric format], type [start / end], trialIndex, triggerIndex }
    const matlabTriggers = [...trialData.sort((a, b) => +a.trialIndex - +b.trialIndex)]
        .map(trial => ({
            trialIndex: +trial.trialIndex,
            startTimeUTC: Date.parse(trial.startTime),
            endTimeUTC: Date.parse(trial.endTime)
        }))
        .reduce((out, trial) => {
            out.push({ 
                absTime: trial.startTimeUTC, 
                relTime: (trial.startTimeUTC - Date.parse(trialData.find(t => t.trialIndex === '1').startTime)) / 1000.,
                type: 'start', 
                trialIndex: trial.trialIndex, 
                triggerIndex: 2 * (trial.trialIndex - 1) 
            });
            out.push({ 
                absTime: trial.endTimeUTC, 
                relTime: (trial.endTimeUTC - Date.parse(trialData.find(t => t.trialIndex === '1').startTime)) / 1000.,
                type: 'end', 
                trialIndex: trial.trialIndex, 
                triggerIndex: 2 * (trial.trialIndex - 1) + 1 
            });
            return out;
        }, []);

    // extract list of triggers from labchart data, format: { absTime [utc numeric format], relTime [seconds], triggerIndex }
    const labchartTriggers = labchartData
        .filter(sample => sample.trigger)
        .map((triggerSample, triggerIndex) => ({
            absTime: triggerSample.absTime,
            relTime: triggerSample.relTime,
            triggerIndex
        }));

    // merge lists
    const mergedTriggers = matlabTriggers.map(matlabTrigger => {
        const labchartTrigger = labchartTriggers.find(o => o.triggerIndex === matlabTrigger.triggerIndex);
        return {
            triggerIndex: matlabTrigger.triggerIndex,
            trialIndex: matlabTrigger.trialIndex,
            triggerType: matlabTrigger.type,
            absTimeMatlabUTC: matlabTrigger.absTime,
            relTimeMatlabSecs: matlabTrigger.relTime,
            absTimeLabchartUTC: labchartTrigger.absTime,
            relTimeLabchartSecs: labchartTrigger.relTime
        }
    });
    return mergedTriggers;
}