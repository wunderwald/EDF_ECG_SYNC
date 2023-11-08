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
};

export const eyelinkEventsToLabchartTime = ({ triggers, fixations, saccades, blinks }) => {
    const trialStartTriggersLabchart = triggers
        .filter(trigger => trigger.triggerType === 'start')
        .map(trigger => ({
            trialIndex: trigger.trialIndex,
            relTimeSecs: trigger.relTimeLabchartSecs,
        }));
    const fixationsRelativeToLabchart = fixations.map(fixation => {
        const trialStartTigger = trialStartTriggersLabchart.find(trigger => trigger.trialIndex === fixation.trialIndex);
        return {
            relStartTimeSecs: +(trialStartTigger.relTimeSecs + (fixation.startTimeRelToTrialStartMillis / 1000.)).toFixed(4),
            relEndTimeSecs: +(trialStartTigger.relTimeSecs + (fixation.endTimeRelToTrialStartMillis / 1000.)).toFixed(4),
            fixDuration: +fixation.duration
        };
    });
    const saccadesRelativeToLabchart = saccades.map(saccade => {
        const trialStartTigger = trialStartTriggersLabchart.find(trigger => trigger.trialIndex === saccade.trialIndex);
        return {
            relStartTimeSecs: +(trialStartTigger.relTimeSecs + (saccade.startTimeRelToTrialStartMillis / 1000.)).toFixed(4),
            relEndTimeSecs: +(trialStartTigger.relTimeSecs + (saccade.endTimeRelToTrialStartMillis / 1000.)).toFixed(4),
            sacAvgVelocity: +saccade.avgVelocity
        };
    });
    const blinksRelativeToLabchart = blinks.map(blink => {
        const trialStartTigger = trialStartTriggersLabchart.find(trigger => trigger.trialIndex === blink.trialIndex);
        return {
            relStartTimeSecs: +(trialStartTigger.relTimeSecs + (blink.startTimeRelToTrialStartMillis / 1000.)).toFixed(4),
            relEndTimeSecs: +(trialStartTigger.relTimeSecs + (blink.endTimeRelToTrialStartMillis / 1000.)).toFixed(4),
        };
    });
    return {
        fixations: fixationsRelativeToLabchart,
        saccades: saccadesRelativeToLabchart,
        blinks: blinksRelativeToLabchart
    };
};

export const addEyelinkEventsToLabchartData = ({ labchartData, eyelinkEvents }) => labchartData.map(sample => ({
    ...sample,
    fixation: +!!eyelinkEvents.fixations.find(fixation => fixation.relStartTimeSecs <= sample.relTime && fixation.relEndTimeSecs >= sample.relTime),
    fixationDuration: eyelinkEvents.fixations.find(fixation => fixation.relStartTimeSecs <= sample.relTime && fixation.relEndTimeSecs >= sample.relTime)?.fixDuration || -1,
    saccade: +!!eyelinkEvents.saccades.find(saccade => saccade.relStartTimeSecs <= sample.relTime && saccade.relEndTimeSecs >= sample.relTime),
    saccadeAvgVelocity: eyelinkEvents.saccades.find(saccade => saccade.relStartTimeSecs <= sample.relTime && saccade.relEndTimeSecs >= sample.relTime)?.sacAvgVelocity || -1,
    blink: +!!eyelinkEvents.blinks.find(blink => blink.relStartTimeSecs <= sample.relTime && blink.relEndTimeSecs >= sample.relTime)
}));

export const splitLabchartDataByTrials = ({ labchartData, triggers }) => {
    const trialIndices = [...(new Set(triggers.map(trigger => trigger.trialIndex)))];
    const trialTimes = trialIndices.map(trialIndex => ({
        trialIndex: trialIndex,
        relStartTimeSecs: triggers.find(trigger => trigger.trialIndex === trialIndex && trigger.triggerType === 'start').relTimeLabchartSecs,
        relEndTimeSecs: triggers.find(trigger => trigger.trialIndex === trialIndex && trigger.triggerType === 'end').relTimeLabchartSecs
    }));
    const trials = trialIndices.map(trialIndex => ({ trialIndex, data: [] }));
    labchartData.forEach(sample => {
        const trialIndex = trialTimes.find(t => t.relStartTimeSecs <= sample.relTime && t.relEndTimeSecs >= sample.relTime)?.trialIndex;
        if(!trialIndex) return;
        trials.find(trial => trial.trialIndex === trialIndex).data.push(sample);
    });
    return trials;
};