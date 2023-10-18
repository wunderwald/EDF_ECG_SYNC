import { log, warn, error, success, logNewline } from './log.js';
import { parseXLS } from './parseXLS.js';
import { getSubjectsEyelink } from './getSubjects.js';

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
console.log(eyelinkSubjects);

// test reading xls
const xlsData = parseXLS({ path: eyelinkSubjects[0].fixPath });

console.log(xlsData[0]);