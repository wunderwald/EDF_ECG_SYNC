const fs = require('fs');
const readCSV = require('./readCSV');

const discoverFrameDataFiles = path => {

    //recursively call this function if path points to directory
    const pathIsDirectory = fs.lstatSync(path).isDirectory();
    if(pathIsDirectory){
        return fs.readdirSync(path).reduce((files, child) => {
            discoverFrameDataFiles(`${path}/${child}`)
                .forEach(file => files.push(file));
            return files;
        }, []);
    }

    //return path if it points to a trialData csv
    const pathIsTrialDataFile = path
        && fs.lstatSync(path).isFile() 
        && path.includes('frameData')
        && path.endsWith('.csv');
    if(pathIsTrialDataFile){
        return [ path ];
    }
    //return empty array if path points to other file type
    return [];
}

const getSubjectCodeFromPath = path => {
    const parts = path.split('/');
    return parts[parts.length-2];
}

const getTrialIndexFromPath = path => {
    const parts = path.split('/');
    const frameDataFilename = parts[parts.length-1];
    const filenameParts = frameDataFilename.split('_');
    const indexAndFileExtension = filenameParts[filenameParts.length-1];
    return +(indexAndFileExtension.split('.')[0]);
}

const getStimulusOutputSignal = (frameData, path) => {
    const isIBeatFile = path.toUpperCase().includes("IBEAT");
    const isIBreathFile = path.toUpperCase().includes("IBREATH");
    if(isIBreathFile) return frameData.map(o => +o.stimulusLevel);
    if(isIBeatFile) return frameData.map(o => o.stimulusState === "ON" ? 1 : 0);
    return null;
}

const getStimulusInputSignal = (frameData, path) => {
    const isIBeatFile = path.toUpperCase().includes("IBEAT");
    const isIBreathFile = path.toUpperCase().includes("IBREATH");
    if(isIBreathFile) return frameData.map(o => +o.breathLevel_input);
    if(isIBeatFile) return frameData.map(o => o.ecgState === "ON" ? 1 : 0);
    return null;
}

const getStimulusScaledSignal = (frameData, path) => {
    const isIBreathFile = path.toUpperCase().includes("IBREATH");
    if(isIBreathFile) return frameData.map(o => +o.breathLevel_scaled);
    return null;
}


module.exports = iBXXDataPaths => {

    //discover frameData*.csv files under the given paths
    const files = iBXXDataPaths.reduce(
        (files, path) => {
            discoverFrameDataFiles(path)
                .forEach(file => files.push(file));
            return files;
        }, 
        []
    );

    //parse each frame data csv file and select the first (and only) row
    const parsedFrameData = files.map(file => ({
        file: file,
        data: readCSV(file),
    }));

    //select the required fields from each object
    const frameData = parsedFrameData.map(o => Object({
        trialDataFile: o.file,
        subjectCode: getSubjectCodeFromPath(o.file),
        trialIndex: getTrialIndexFromPath(o.file),
        stimulusInputSignal: getStimulusInputSignal(o.data, o.file),
        stimulusScaledSignal: getStimulusScaledSignal(o.data, o.file),
        stimulusOutputSignal: getStimulusOutputSignal(o.data, o.file),
    }));

    return frameData;
};