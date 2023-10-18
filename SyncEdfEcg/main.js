import { log, warn, error, success, logNewline } from './log.js';
import { getSubjectsEyelink, getSubjectsLabchart } from './getSubjects.js';
import { parseXLS } from './parseXLS.js';


// I/O dirs
const inputBaseDir = './inputData';
const inputDirs = {
    matlab: `${inputBaseDir}/matlab`,
    eyelink: `${inputBaseDir}/eyelink`,
    labchart: `${inputBaseDir}/labchart`
};
const outputDir = null;

// read eyelink dir
const eyelinkSubjects = getSubjectsEyelink({ eyelinkDir: inputDirs.eyelink });

// read labchart dir
const labchartSubjects = getSubjectsLabchart({ labchartDir: inputDirs.labchart });
console.log(labchartSubjects)

// // test reading xls
// const xlsData = parseXLS({ path: eyelinkSubjects[0].fixPath });
// console.log(xlsData[0]);