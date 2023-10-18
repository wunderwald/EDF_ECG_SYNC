import { log, warn, error, success, logNewline } from './log.js';
import * as fs from 'fs';

const getDirList = ({ dir, fileExtension }) => fs.readdirSync(dir)
    .filter(file => fs.lstatSync(`${dir}/${file}`).isFile())
    .filter(file => file.endsWith(fileExtension))
    .map(file => ({ file, path: `${dir}/${file}` }));

const analyzeEyelinkFiles = ({ fileList }) => fileList.map(({ file, path }) => {
    const [ageGroup, subjectID, reportType] = file.replace('.xls', '').split('_');
    return { subjectID, reportType, ageGroup, path, file };
});

const fixSubjectId = ({ subjectID }) => {
    if (subjectID.length === 3) return subjectID;
    if (subjectID.length === 2) return `0${subjectID}`;
    if (subjectID.length === 1) return `00${subjectID}`;
    warn(`invalid format of subject id: ${subjectID} (must be 3 or less characters long)`)
}

export const getSubjectsEyelink = ({ eyelinkDir }) => {
    logNewline();
    log('reading eyelink files (saccade and fixation reports)')
    // make objects { subjectID, reportType, ageGroup, path, file } for each xls file in the input dir
    const xlsFiles = analyzeEyelinkFiles({ fileList: getDirList({ dir: eyelinkDir, fileExtension: '.xls' }) });
    // get unique list of subjects
    const subjectIDs = [...(new Set(xlsFiles.map(o => o.subjectID)))];
    // for each subject that has both fx and sacc files, make objects { subjectID, fixPath, saccPath }
    return subjectIDs.map(subjectID => {
        // get fix file
        const fixFile = xlsFiles.find(o => o.subjectID === subjectID && o.reportType === 'fix');
        if (!fixFile) {
            warn(`no fixation report found for subject ${subjectID}.`);
            return null;
        }
        // get sacc file
        const saccFile = xlsFiles.find(o => o.subjectID === subjectID && o.reportType === 'sacc');
        if (!saccFile) {
            warn(`no saccade report found for subject ${subjectID}.`);
            return null;
        }
        success(`saccade and fixation reports found for subject ${subjectID}.`)
        return {
            subjectID: fixSubjectId({ subjectID }),
            fixPath: fixFile.path,
            saccPath: saccFile.path
        };
    }).filter(o => o);
};