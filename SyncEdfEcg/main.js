import { log, warn, error, success, info, logNewline, SET_LOG } from './log.js';
import { min, max, mean } from './stat.js';
import { getSubjectsEyelink, getSubjectsLabchart, getSubjectsMatlab, unifySubjectLists } from './getSubjects.js';
import { parseXLS } from './parseXLS.js';
import { parseLabchartTxt, processLabchartData } from './parseLabchartData.js';
import { parseTrialData } from './parseMatlabData.js';
import { mergeTriggerTimes } from './mergeData.js';

// toggle logging
SET_LOG(true);

// I/O dirs
const inputBaseDir = './inputData';
const inputDirs = {
    matlab: `${inputBaseDir}/matlab`,
    eyelink: `${inputBaseDir}/eyelink`,
    labchart: `${inputBaseDir}/labchart`
};
const outputDir = null;

// get subject list: each subject must have a fixation and saccade report, a labchart ecg file and a matlab data dir
const eyelinkSubjects = getSubjectsEyelink({ eyelinkDir: inputDirs.eyelink });
const labchartSubjects = getSubjectsLabchart({ labchartDir: inputDirs.labchart });
const matlabSubjects = getSubjectsMatlab({ matlabDir: inputDirs.matlab });  // todo: test matlab dir content
const subjects = unifySubjectLists({ eyelinkSubjects, labchartSubjects, matlabSubjects });

subjects.forEach((subject, i) => {

    if(i > 0) return;

    logNewline();
    log(`processing subject ${subject.subjectID}`);

    // parse matlab data
    log('parsing matlab trial data...');
    const trialData = parseTrialData({ matlabDirPath: subject.matlabSubdir });

    // parse eyelink data
    log('parsing eyelink fixation report...');
    const fixationData = parseXLS({ path: subject.fixationReportPath });
    log('parsing eyelink saccade report...');
    const saccadeData = parseXLS({ path: subject.saccadeReportPath });

    // parse labchart data: labchartData is an array of recordings, each recording is an array of samples & a start time in UTF
    log('parsing labchart data...');
    const labchartDataArr = parseLabchartTxt({ path: subject.labchartPath });
    if (labchartDataArr.length !== 1) {
        error(`invalid number of recordings in labchart data: found ${labchartDataArr.length}, expected 1`);
        return;
    }
    const labchartData = processLabchartData({ labchartDataRaw: labchartDataArr[0] });

    // combine trial start/end times from labchart and matlab
    log(`processing triggers/markers in matlab and labchart data...`)
    const numTrialsMatlab = trialData.length;
    const numTriggersLabchart = labchartData.filter(sample => sample.trigger).length;
    if(numTriggersLabchart !== 2*numTrialsMatlab){
        error(`number of trials (${numTrialsMatlab}) doesn't match number of triggers in labchart data (${numTriggersLabchart}) [there must be two triggers for each trial]`);
        return;
    }
    const triggerTimes = mergeTriggerTimes({ trialData, labchartData });

    // calculate matlab / labchart offset of relative times
    const relTimeOffsetsSecs = triggerTimes.map(o => o.relTimeLabchartSecs - o.relTimeMatlabSecs);
    info(`offset/delay between relative trigger times between matlab and labchart (seconds)\n\tmean: ${mean(relTimeOffsetsSecs).toFixed(2)}\n\tmin: ${min(relTimeOffsetsSecs).toFixed(2)}\n\tmax: ${max(relTimeOffsetsSecs).toFixed(2)}\n\t! these are due to the recording start time in labchart only, no reason to worry.\n\t! An offset of 60 on the first trigger means that the labchart recording has been started 60s before the first trial in matlab started.`);

    // extract blink, saccade, fixation timing from eyelink data
    // TODO

    // append isFixated, isSaccade, isBlink to labchart data as binary channels
    // TODO

    // export expanded labcgart data
    // TODO

});