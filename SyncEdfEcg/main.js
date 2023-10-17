import * as fs from 'fs';

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