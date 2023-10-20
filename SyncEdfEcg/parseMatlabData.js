import * as fs from 'fs';
import { parseCSV } from './parseCSV.js';

const listFiles = ({ dir, partialFilename, fileExtension }) => fs.readdirSync(dir)
    .filter(file => fs.lstatSync(`${dir}/${file}`).isFile())
    .filter(file => file.includes(partialFilename))
    .filter(file => file.endsWith(fileExtension))
    .map(file => `${dir}/${file}`);

const readAndParseCsv = ({ path }) => parseCSV({ csvData: fs.readFileSync(path) })[0];

export const parseTrialData = ({ matlabDirPath }) => {
    const trialDataFiles = listFiles({ dir: matlabDirPath, partialFilename: 'trialData', fileExtension: '.csv' });
    const trialData = trialDataFiles
        .map(path => readAndParseCsv({ path: path }))
        .map(o => ({
            trialIndex: o.trialIndex,
            startTime: o.startTime,
            endTime: o.endTime
        }));
    return trialData;
};