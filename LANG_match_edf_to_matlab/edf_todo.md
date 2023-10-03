# EXTRACT FIXATION TIMES FROM EDF

## Input Files

- Matlab File (csv): Main source of data, potentially inprecise fixation time, precise trial duration
- EDF File (csv): 1 row per fixation, precise fixation time

## Extraction

- Use col "TrialId" to split recording into trials
- Use col "AH" (col name in excel, contains messages) to filter rows from "STIMULUS_START" to "STIMULUS_END" (include the rows with these messages) -> exclude attention grabber
- Sum up Fixation Durations in column "N"

## Output File

- copy all columns from matlab file
- attach "fixationTimeEdf" and "fixationPercentageEdf"
- fixationPercentageEdf = fixationTimeEdf / {trial/stimulus duration from matlab file}

## Preprocessing sub 001-005

merge edf files: 1 file per trial for these subjects
