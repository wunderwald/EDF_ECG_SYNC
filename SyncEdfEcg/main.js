import { log, warn, error, success, logNewline } from  './log.js';
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

// // test reading xls
// const xlsFile = `${inputDirs.eyelink}/est9m.xls`;
// const xlsData = parseXLS(xlsFile);
// const columns = xlsData[0].data[0];
// const xlsDataNamed = xlsData[0].data.reduce((out, row, rowIndex) => {
//     if(rowIndex === 0) return out;
//     out.push(columns.reduce((newRow, columnId, columnIndex) => {
//         newRow[columnId] = row[columnIndex];
//         return newRow;
//     }, ({})));
//     return out;
// }, []);
// console.log(xlsDataNamed[0]);