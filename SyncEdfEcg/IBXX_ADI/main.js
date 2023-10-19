const discoverInputFiles = require('./discoverInputFiles');
const readRawDataAdi = require('./readRawData');
const flatten = require('./flattenAdiData');
const split = require('./splitStreams');
const discoverTrialData = require('./discoverTrialData');
const readFrameData = require('./readFrameData');
const write = require('./writeTrial');
const registerFiles = require('./registerFiles');
const writeWarnings = require('./writeWarnings');
const upsampleStep = require('./upsampleStep');

const warn = w => console.warn(`❌ ${w}`);
const trialMatchesSubject = (trial, subjectId) => 
    trial.trialDataFile.toLocaleLowerCase().includes(subjectId.toLocaleLowerCase());
const getStimulusOutSignal = (frameData, subjectId, trialIndex) => 
    frameData.find(fd => fd.subjectCode === subjectId && fd.trialIndex === trialIndex)?.stimulusOutputSignal;
const getStimulusInSignal = (frameData, subjectId, trialIndex) => 
    frameData.find(fd => fd.subjectCode === subjectId && fd.trialIndex === trialIndex)?.stimulusInputSignal;
const getStimulusSclSignal = (frameData, subjectId, trialIndex) => 
    frameData.find(fd => fd.subjectCode === subjectId && fd.trialIndex === trialIndex)?.stimulusScaledSignal;

const main = () => {

    const outputDir = './data/output';
    
    //discover input files
    const rawDir = './data/labchart';
    const rawFiles = discoverInputFiles(rawDir, 'txt');

    console.log(rawFiles);

    //get a summary of all trial data files
    const iBXXDataPaths = ['./data/matlab'];
    const trialData = discoverTrialData(iBXXDataPaths);

    //read frame data for each trial
    const frameData = readFrameData(iBXXDataPaths);

    //initialize warnings
    const warnings = [];

    rawFiles.forEach((rawFile) => {
        const rawPath = `${rawDir}/${rawFile}`;
        console.log(`\n\n${rawPath}`);

        //read adi data (output array of objects: {recordingIndex, data})
        const recordings = readRawDataAdi(rawPath);

        //sanity check 1:
        //... there should be exactly 2 recordings ( 0: preset, 1: actual recording of trials) 
        //... or exactly 1 recording ( 0: recording of trials)
        const numRecordingsIsValid = recordings.length === 2 || recordings.length === 1;
        if(!numRecordingsIsValid){
            const w = `Invalid number of recordings (expected 1 or 2, found ${recordings.length})`;
            warn(w);
            warnings.push({ file: rawPath, warning: w });
            return;
        }

        //select recording to be processed
        const recording = recordings[recordings.length - 1].data;

        //flatten data (create 1d stream per channel)
        const streams = flatten(recording);

        //split streams using matlab stream
        const segments = split(streams);      
        console.log(`## ${segments.length} segments`);

        //read subject id and calculate number of trialData files for this subject
        const subjectId = rawFile.substring(0, rawFile.length - '.txt'.length);
        const numTrials = trialData
            .filter(trial => trialMatchesSubject(trial, subjectId))
            .length;          

        //sanity check 2:
        //there should be at least one trial
        if(numTrials <= 0){
            const w = "0 trials found (most likely this has to do with missing matlab files).";
            warn(w);
            warnings.push({ file: rawPath, warning: w });
            return;
        }
        console.log(`## ${numTrials} trials`);

        //sanity check 3:
        //the number of segments must equal 2 * numTrialsOfSubject + 1
        //first an last segment: intervals between rec start/end and first/last marker
        //teh: seg[1]: trial 1, seg[2]: ITI 1, seg[3]: trial 2...
        const segmentsMatchTrials = segments.length === (2 * numTrials) + 1;
        if(!segmentsMatchTrials){
            const w = `Number of segments doesn't match number of trials (${(2 * numTrials) + 1} segments expected, found ${segments.length})`;
            warn(w);
            warnings.push({ file: rawPath, warning: w });
            return;
        }

        //transform segents => trials
        const trials = segments
            .filter((segment, i) => i%2 === 1 && i !== segments.length - 1)
            .map((segment, i) => Object({
                ...segment, 
                stim_in: upsampleStep(getStimulusInSignal(frameData, subjectId, i+1), segment.time.length), 
                stim_in_scl: upsampleStep(getStimulusSclSignal(frameData, subjectId, i+1), segment.time.length), 
                stim_out: upsampleStep(getStimulusOutSignal(frameData, subjectId, i+1), segment.time.length), 
                trialIndex: i+1,
            }));

        //clean up stimulus signals: 
        const allStimulusOutputSignalsExist = trials.every(trial => trial.stim_out !== null && trial.stim_out !== undefined);
        if(!allStimulusOutputSignalsExist){
            console.log("⚠️  Stimulus out signals could not be retrieved for all trials.");
            trials.forEach(trial => !trial.stim_out && delete trial.stim_out);
        }
        const allStimulusInputSignalsExist = trials.every(trial => trial.stim_in !== null && trial.stim_in !== undefined);
        if(!allStimulusInputSignalsExist){
            console.log("⚠️  Stimulus in signals could not be retrieved for all trials.");
            trials.forEach(trial => !trial.stim_in && delete trial.stim_in);
        }
        const allStimulusSclSignalsExist = trials.every(trial => trial.stim_in_scl !== null && trial.stim_in_scl !== undefined);
        if(!allStimulusSclSignalsExist){
            trials.forEach(trial => !trial.stim_in_scl && delete trial.stim_in_scl);
        }

        //write trials
        trials.forEach(trial => write(trial, subjectId, outputDir));

        console.log("✅ Segments properly mapped to trials");
    });

    //create or update registry
    registerFiles(outputDir, 'json');

    //write warnings to json
    writeWarnings(warnings);
};

main();