# EDF_ECG_SYNC

Synchronise eyetracking data recorded to Eyelink EDF format with ECG recordings made with ADInstruments' LabChart for the experiment iBEAT.

## ./ConvertEDF

Automatically convert EDF files to XLS files. Not implemented yet.

## ./SyncEdfEcg

Synchronise eyetracking and ECG data. Requires Eyelink data to be converted to XLS files and LabChart data to be exported to TXT files.

### How to run

Install dependencies, set up directories, follow naming conventions and run the scxript.

#### Dependencies

- node.js must be installed
- install the library ```csv```: ```npm i csv --save```

#### Directory Structure

- create directories: 
    * ```./inputData```
    * ```./inputData/eyelink```
    * ```./inputData/labchart```
    * ```./inputData/matlab```
- eyetracking XLS files go to ```./inputData/eyelink```
- ECG TXT files go to ```./inputData/labchart```
- CSV trialData from the iBEAT MATLAB script go to subdirectories of ```./inputData/matlab```. One subdirectory per subject.

#### Naming conventions

- ```./inputData/eyelink```: group_subjectID_reportType.xls (e.g. 9mo_09_sacc.xls or 18mo_028_fix.xls)
- ```./inputData/labchart```: subjectID_group.txt (e.g. 014_ibeat.txt or 62_9mo.txt)
- ```./inputData/matlab```: subjectID_group (e.g. 014_ibeat or 62_9mo) for the subdirectories, trialData_trialIndex.csv for inner files (e.g. trialData_3.csv)

#### Run the main script

```node main```