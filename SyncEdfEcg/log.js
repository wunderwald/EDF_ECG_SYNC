import * as fs from 'fs';

let LOG = true;
let logText = '';

export const SET_LOG = doLog => LOG = doLog;

export const getLogTxt = () => logText;
export const logToFile = ({ logDir }) => fs.writeFileSync(`${logDir}/log_${new Date().getTime()}.txt`, logText);

export const log = msg => {
    LOG && console.log(`👀 ${msg}`);
    logText = `${logText}👀 ${msg}\n`;
};
export const success = msg => {
    LOG && console.log(`🥰 ${msg}`);
    logText = `${logText}🥰 ${msg}\n`;
};
export const warn = msg => {
    LOG && console.log(`😳 ${msg}`);
    logText = `${logText}😳 ${msg}\n`;
};
export const error = msg => {
    LOG && console.log(`🤬 ${msg}`);
    logText = `${logText}🤬 ${msg}\n`;
};
export const info = msg => {
    LOG && console.log(`🤓 ${msg}`);
    logText = `${logText}🤓 ${msg}\n`;
};
export const logNewline = () => {
    LOG && console.log();
    logText = `${logText}\n`;
};