import { log, warn, error, success, logNewline } from './log.js';
import { getSubjectsEyelink, getSubjectsLabchart, getSubjectsMatlab, unifySubjectLists } from './getSubjects.js';
import { parseXLS } from './parseXLS.js';
import { parseLabchartTxt } from './parseLabchartData.js';
import { parseTrialData } from './parseMatlabData.js';


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
    const labchartData = parseLabchartTxt({path: subject.labchartPath });


    /*
    TODO:
    - add steps from IBXX_ADI for processing labchart:
        - test number recordings (0:preset, 1: actual recording)
        - select right recording, flatten, split (using matlab data)
        - transfrom segments to trials (using matlab data)
    - append eyelink data to labchart data:
        - keep all existing channels
        - add isFixated, isSaccade, isBlink as binary channels
    - export
    */

});