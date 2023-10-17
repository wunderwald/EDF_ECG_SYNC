import * as fs from 'fs';

// each subject has a folder that includes at least csv and asc (converted from edf) files
const isSubjectDir = dir =>
    fs.readdirSync(dir).some(file => file.endsWith('.csv'))
    && fs.readdirSync(dir).some(file => file.endsWith('.asc'));

export const getSubjects = ({ inputDir }) => fs.readdirSync(inputDir)
    .filter(subDir => fs.lstatSync(`${inputDir}/${subDir}`).isDirectory())
    .filter(subDir => isSubjectDir(`${inputDir}/${subDir}`))
    .map(subDir => ({
        id: subDir,
        dir: `${inputDir}/${subDir}`
    }));
