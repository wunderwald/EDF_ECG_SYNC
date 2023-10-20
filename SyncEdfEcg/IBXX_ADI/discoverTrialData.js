const fs = require('fs');
const readCSV = require('./readCSV');

const discoverTrialDataFiles = path => {

    //recursively call this function if path points to directory
    const pathIsDirectory = fs.lstatSync(path).isDirectory();
    if(pathIsDirectory){
        return fs.readdirSync(path).reduce((files, child) => {
            discoverTrialDataFiles(`${path}/${child}`)
                .forEach(file => files.push(file));
            return files;
        }, []);
    }

    //return path if it points to a trialData csv
    const pathIsTrialDataFile = path
        && fs.lstatSync(path).isFile() 
        && path.includes('trialData')
        && path.endsWith('.csv');
    if(pathIsTrialDataFile){
        return [ path ];
    }
    //return empty array if path points to other file type
    return [];
}


module.exports = iBXXDataPaths => {

    //discover trialData*.csv files under the given paths
    const files = iBXXDataPaths.reduce(
        (files, path) => {
            discoverTrialDataFiles(path)
                .forEach(file => files.push(file));
            return files;
        }, 
        []
    );

    //parse each trial data csv file and select the first (and only) row
    const parsedTrialData = files.map(file => ({
        file: file,
        data: readCSV(file)[0],
    }));

    //select the required fields from each object
    const summary = parsedTrialData.map(o => Object({
        trialDataFile: o.file,
        subjectCode: o.data.subjectCode,
        trialIndex: o.data.trialIndex,
        trialType: o.data.trialType,
    }));

    return summary;
};