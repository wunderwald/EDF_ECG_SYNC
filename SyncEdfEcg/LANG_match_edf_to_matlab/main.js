const fs = require('fs');
const getSubjects = require('./getSubjects');
const parseCsv = require('./parseCsv');
const getFixationTime = require('./getFixationTime');
const parseArrayString = require('./parseArrayString');

// input paths
const inputDirMatlab = "./matlabData";
const inputDirEdf = "./edfData";

// get list of subjects
const subjects = getSubjects(inputDirMatlab);

// path constructors
const makeEdfPath = subjectId => `${inputDirEdf}/lang_${subjectId}_edf.csv`;
const makeMatlabPath = subjectId => `${inputDirMatlab}/lang_${subjectId}_matlab.csv`;

// process data per subject
subjects.forEach(subjectId => {

    console.log(`\n➡️  Processing subject ${subjectId}`)

    // make input paths
    const edfPath = makeEdfPath(subjectId);
    const matlabPath = makeMatlabPath(subjectId);
    if(!fs.existsSync(edfPath)){
        console.error(`❌ no edf file found ${subjectId} [expected ${edfPath}]`);
        return;
    }

    // read trials from matlab file
    const trials = parseCsv(matlabPath, ',');

    // read fixations from edf data
    const fixations = parseCsv(edfPath, ';')
        .map(o => ({
            trialIndex: o.TRIAL_INDEX,
            fixationIndex: +o.CURRENT_FIX_INDEX,
            duration: +o.CURRENT_FIX_DURATION,
            messages: o.CURRENT_FIX_MSG_LIST_TEXT ? parseArrayString(o.CURRENT_FIX_MSG_LIST_TEXT) : [],
            messageTimes: o.CURRENT_FIX_MSG_LIST_TIME ? parseArrayString(o.CURRENT_FIX_MSG_LIST_TIME).map(t => +t) : [],
            startTime: +o.CURRENT_FIX_START,
            endTime: +o.CURRENT_FIX_END
        }));
    
    //calculate edf fixation time per trial
    const trialsExtended = trials.map(trial => {
        const trialIndex = trial.Trial;
        const edfTimes = getFixationTime(fixations, trialIndex);
        
        const fixationTimeEdf = edfTimes.fixationDuration_s;
        const fixationPercentEdf = edfTimes.fixationPercent;
        const stimulusDurationEdf = edfTimes.stimulusDuration_s;
        const edfIncludesStartMarker = edfTimes.recordingIncludesStartMarker;
        const edfIncludesEndMarker = edfTimes.recordingIncludesEndMarker;

        return {
            ...trial,
            edfIncludesStartMarker,
            edfIncludesEndMarker,
            edfTimingIsPrecise: edfIncludesStartMarker && edfIncludesEndMarker,
            fixationTimeEdf,
            fixationPercentEdf,
            stimulusDurationEdf,
        }
    });

    //console.log(trialsExtended.filter(t => t.edfTimingIsPrecise));
    console.log(trialsExtended);
    

})