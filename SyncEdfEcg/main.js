import { log, warn, error, success, info, logNewline, SET_LOG, logToFile } from './log.js';
import { getSubjectsEyelink, getSubjectsLabchart, getSubjectsMatlab, unifySubjectLists } from './getSubjects.js';
import { parseXLS } from './parseXLS.js';
import { parseLabchartTxt, processLabchartData } from './parseLabchartData.js';
import { parseTrialData } from './parseMatlabData.js';
import { mergeTriggerTimes, eyelinkEventsToLabchartTime, addEyelinkEventsToLabchartData, splitLabchartDataByTrials } from './mergeData.js';
import { trialToCSV } from './write.js';
import * as fs from 'fs';

// toggle console logging
SET_LOG(true);

// I/O dirs
const inputBaseDir = './inputData';
const inputDirs = {
    matlab: `${inputBaseDir}/matlab`,
    eyelink: `${inputBaseDir}/eyelink`,
    labchart: `${inputBaseDir}/labchart`
};
const outputDir = './outputData';
const logDir = './logs';

// create or overwrite output dirs
if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// get subject list: each subject must have a fixation and saccade report, a labchart ecg file and a matlab data dir
const eyelinkSubjects = getSubjectsEyelink({ eyelinkDir: inputDirs.eyelink });
const labchartSubjects = getSubjectsLabchart({ labchartDir: inputDirs.labchart });
const matlabSubjects = getSubjectsMatlab({ matlabDir: inputDirs.matlab });  // todo: test matlab dir content
const subjects = unifySubjectLists({ eyelinkSubjects, labchartSubjects, matlabSubjects });

subjects.forEach((subject, i) => {

    if(i>0)return;

    logNewline();
    log(`processing subject ${subject.subjectID}`);

    // parse matlab data
    log('parsing matlab trial data...');
    const trialData = parseTrialData({ matlabDirPath: subject.matlabSubdir });

    // parse eyelink data
    log('parsing eyelink fixation report...');
    const fixationDataRaw = parseXLS({ path: subject.fixationReportPath });
    log('parsing eyelink saccade report...');
    const saccadeDataRaw = parseXLS({ path: subject.saccadeReportPath });

    // parse labchart data: labchartData is an array of recordings, each recording is an array of samples & a start time in UTF
    log('parsing labchart data...');
    const labchartDataArr = parseLabchartTxt({ path: subject.labchartPath });
    if (labchartDataArr.length !== 1) {
        error(`invalid number of recordings in labchart data: found ${labchartDataArr.length}, expected 1`);
        return;
    }
    const labchartData = processLabchartData({ labchartDataRaw: labchartDataArr[0] });

    // combine trial start/end times from labchart and matlab
    log(`merging triggers/markers from matlab and labchart data...`)
    const numTrialsMatlab = trialData.length;
    const numTriggersLabchart = labchartData.filter(sample => sample.trigger).length;
    if (numTriggersLabchart !== 2 * numTrialsMatlab) {
        error(`number of trials (${numTrialsMatlab}) doesn't match number of triggers in labchart data (${numTriggersLabchart}) [there must be two triggers for each trial]`);
        return;
    }
    const triggers = mergeTriggerTimes({ trialData, labchartData });

    // process fixation data
    log("processing fixation data...");
    const fixationData = fixationDataRaw.map(fixation => ({
        trialIndex: +fixation.TRIAL_INDEX,
        startTimeRelToTrialStartMillis: +fixation.CURRENT_FIX_START,
        endTimeRelToTrialStartMillis: +fixation.CURRENT_FIX_END,
        duration: +fixation.CURRENT_FIX_DURATION
    }));

    //process saccade data
    log("processing saccade data...");
    const saccadeData = saccadeDataRaw.map(saccade => ({
        trialIndex: +saccade.TRIAL_INDEX,
        startTimeRelToTrialStartMillis: +saccade.CURRENT_SAC_START_TIME,
        endTimeRelToTrialStartMillis: +saccade.CURRENT_SAC_END_TIME,
        avgVelocity: +saccade.CURRENT_SAC_AVG_VELOCITY
    }));

    //process blink data
    log("processing blink data...");
    const blinkData = saccadeDataRaw.map(saccade => ({
        trialIndex: saccade.TRIAL_INDEX,
        startTimeRelToTrialStartMillis: saccade.CURRENT_SAC_BLINK_START,
        endTimeRelToTrialStartMillis: saccade.CURRENT_SAC_BLINK_END
    })).filter(blink => {
        return blink.startTimeRelToTrialStartMillis !== '.' && blink.endTimeRelToTrialStartMillis !== '.'
    }).map(blink => ({
        trialIndex: +blink.trialIndex,
        startTimeRelToTrialStartMillis: +blink.startTimeRelToTrialStartMillis,
        endTimeRelToTrialStartMillis: +blink.endTimeRelToTrialStartMillis
    }));

    // mapping fixations, saccades and blinks to labchart time
    log("mapping fixations, saccades and blinks to labchart time...");
    const eyelinkEventsInLabchartTime = eyelinkEventsToLabchartTime({
        triggers: triggers,
        fixations: fixationData,
        saccades: saccadeData,
        blinks: blinkData
    });

    // append fixation, saccade, blink to labchart data as binary channels
    log("appending fixations, saccades, blinks to labchart data...");
    const extendedLabchartData = addEyelinkEventsToLabchartData({
        labchartData: labchartData,
        eyelinkEvents: eyelinkEventsInLabchartTime
    });

    // split labchart data by triggers
    log("splitting extended labchart data into trials...");
    const extendedLabchartDataByTrial = splitLabchartDataByTrials({ labchartData: extendedLabchartData, triggers: triggers });

    // export extended labchart data
    log("exporting data...");
    const outputSubdir = `${outputDir}/${subject.subjectID}`;
    fs.mkdirSync(outputSubdir);
    extendedLabchartDataByTrial.forEach(trial => trialToCSV({ trial: trial, outputDir: outputSubdir }));
});

// write log to file
logNewline();
log("exporting log...");
logToFile({ logDir: logDir });

// be happy
logNewline();
success('done!');

// TODO: export in format for ibxx viewer
// TODO: also use blinks from fixation file?