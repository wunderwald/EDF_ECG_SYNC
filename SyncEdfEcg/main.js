import { parseXLS } from "./parseXLS.js";

// loggers
const LOG = true;
const log = msg => LOG && console.log(`👀 ${msg}`);
const success = msg => LOG && console.log(`🥰 ${msg}`);
const warn = msg => LOG && console.log(`😳 ${msg}`);
const error = msg => LOG && console.log(`🤬 ${msg}`);
const logNewline = () => LOG && console.log();

// I/O dirs
const inputBaseDir = './inputData';
const inputDirs = {
    matlab: `${inputBaseDir}/matlab`,
    eyelink: `${inputBaseDir}/eyelink`,
    labchart: `${inputBaseDir}/labchart`
};
const outputDir = null;

// test reading xls ---- Todo: can i use txt files?
const xlsFile = `${inputDirs.eyelink}/est9m.xls`;
const xlsData = parseXLS(xlsFile);
const columns = xlsData[0].data[0];
const xlsDataNamed = xlsData[0].data.reduce((out, row, rowIndex) => {
    if(rowIndex === 0) return out;
    out.push(columns.reduce((newRow, columnId, columnIndex) => {
        newRow[columnId] = row[columnIndex];
        return newRow;
    }, ({})));
    return out;
}, []);
console.log(xlsDataNamed[0]);