import * as fs from 'fs';

export const trialToCSV = ({ trial, outputDir }) => {
    const outputPath = `${outputDir}/trial_${trial.trialIndex}.csv`;
    const keys = [...Object.keys(trial.data[0])];
    const head = `${keys.join(',')}\n`;
    const body = trial.data.map(sample => `${keys.map(key => sample[key]).join(',')}`).join('\n');
    const csv = `${head}${body}`;
    fs.writeFileSync(outputPath, csv);
}