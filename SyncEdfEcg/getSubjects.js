import { log, warn, error, success, logNewline } from './log.js';
import * as fs from 'fs';

const getDirList = ({ dir, fileExtension }) => fs.readdirSync(dir)
    .filter(file => fs.lstatSync(`${dir}/${file}`).isFile())
    .filter(file => file.endsWith(fileExtension))
    .map(file => ({ file, path: `${dir}/${file}` }));

const getDirListSubdirs = ({ dir }) => fs.readdirSync(dir)
    .filter(subdir => fs.lstatSync(`${dir}/${subdir}`).isDirectory())
    .map(subdir => ({ subdir, path: `${dir}/${subdir}` }));

const fixSubjectId = ({ subjectID }) => {
    if (subjectID.length === 3) return subjectID;
    if (subjectID.length === 2) return `0${subjectID}`;
    if (subjectID.length === 1) return `00${subjectID}`;
    warn(`invalid format of subject id: ${subjectID} (must be 3 or less characters long)`)
};

const analyzeEyelinkFiles = ({ fileList }) => fileList.map(({ file, path }) => {
    const [ageGroup, subjectID, reportType] = file.replace('.xls', '').split('_');
    return { subjectID, reportType, ageGroup, path, file };
});

const analyzeLabchartFiles = ({ fileList }) => fileList.map(({ file, path }) => {
    const [subjectID, experimentID] = file.replace('.txt', '').split('_');
    return { subjectID, path, file };
});

const analyzeMatlabDirs = ({ subdirList }) => subdirList.map(({ subdir, path }) => {
    if(subdir.split('_').length !== 2){
        warn(`invalid format of matlab subdir: ${subdir}`);
        return null;
    }
    const [subjectID, experimentID] = subdir.split('_');
    return { subjectID, path, subdir };
}).filter(o => o);

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
        // return object { subjectID, fixPath, saccPath }
        const fixedSubjectId = fixSubjectId({ subjectID });
        success(`saccade and fixation reports found for subject ${fixedSubjectId}.`)
        return {
            subjectID: fixedSubjectId,
            fixPath: fixFile.path,
            saccPath: saccFile.path
        };
    }).filter(o => o);
};

export const getSubjectsLabchart = ({ labchartDir }) => {
    logNewline();
    log('reading labchart files (ecg data)')
    // make objects { subjectID, path, file } for each txt file in the input dir
    const txtFiles = analyzeLabchartFiles({ fileList: getDirList({ dir: labchartDir, fileExtension: '.txt' }) });
    if (txtFiles.length === 0) error(`no .txt files found in labchart dir [${labchartDir}]`);
    return txtFiles.map(({ subjectID, path }) => {
        const fixedSubjectId = fixSubjectId({ subjectID });
        success(`labchart file found for subject ${fixedSubjectId}.`);
        return {
            subjectID: fixedSubjectId,
            path: path,
        };
    });
};

export const getSubjectsMatlab = ({ matlabDir }) => {
    logNewline();
    log('reading matlab files (trial and frame data)');
    // make objects { subjectID, path, subdir } for each subdir in the input dir
    const subdirs = analyzeMatlabDirs({ subdirList: getDirListSubdirs({ dir: matlabDir }) });
    if (subdirs.length === 0) error(`no valid subdirs found in matlab dir [${matlabDir}]`);
    return subdirs.map(({ subjectID, path }) => {
        const fixedSubjectId = fixSubjectId({ subjectID });
        success(`matlab subdir found for subject ${fixedSubjectId}.`);
        return {
            subjectID: fixedSubjectId,
            path: path,
        };
    });
};

export const unifySubjectLists = ({ eyelinkSubjects, labchartSubjects, matlabSubjects }) => {
    logNewline();
    log('combining eyelink, labchart and matlab files');
    const subjectIDs = [...(new Set([
        ...eyelinkSubjects.map(o => o.subjectID),
        ...labchartSubjects.map(o => o.subjectID),
        ...matlabSubjects.map(o => o.subjectID),
    ]))];
    return subjectIDs.map(subjectID => {
        const eyelinkFiles = eyelinkSubjects.find(o => o.subjectID === subjectID);
        const labchartFile = labchartSubjects.find(o => o.subjectID === subjectID);
        const matlabSubdir = matlabSubjects.find(o => o.subjectID === subjectID);
        if(!(eyelinkFiles && labchartFile && matlabSubdir)){
            warn(`subject ${subjectID} misses ${eyelinkFiles ? '' : 'eyelink files, '}${labchartFile ? '' : 'labchart file, '}${matlabSubdir ? '' : 'matlab subdir'}`);
            return null;
        }
        return {
            subjectID,
            fixationReportPath: eyelinkFiles.fixPath,
            saccadeReportPath: eyelinkFiles.saccPath,
            labchartPath: labchartFile.path,
            matlabSubdir: matlabSubdir.path
        };
    }).filter(o => o);
}