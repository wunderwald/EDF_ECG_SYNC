import { log, warn, error, success, logNewline } from './log.js';
import { getSubjectsEyelink, getSubjectsLabchart, getSubjectsMatlab, unifySubjectLists } from './getSubjects.js';
import { parseLabchartTxt } from './parseLabchartData.js';
import { parseXLS } from './parseXLS.js';


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

subjects.forEach(subject => {
    logNewline();
    log(`processing subject ${subject.subjectID}`);
    
    // parse eyelink data
    log('parsing eyelink fixation report...');
    const fixationData = parseXLS({ path: subject.fixationReportPath });

    log('parsing eyelink saccade report...');
    const saccadeData = parseXLS({ path: subject.saccadeReportPath });

    // parse labchart data
    log('parsing labchart data...');
    const labchartData = parseLabchartTxt({path: subject.labchartPath });

    console.log(labchartData[0].data);

});