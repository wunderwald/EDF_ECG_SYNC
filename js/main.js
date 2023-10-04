import * as fs from 'fs';
import { getSubjects } from './getSubjects.js';
import { processAsc } from './processAsc.js';

// loggers
const LOG = true;
const log = msg => LOG && console.log(`👀 ${msg}`);
const success = msg => LOG && console.log(`🥰 ${msg}`);
const warn = msg => LOG && console.log(`😳 ${msg}`);
const error = msg => LOG && console.log(`🤬 ${msg}`);
const logNewline = () => LOG && console.log();

// I/O dirs
const inputDir = './inputData';
const outputDir = null;

// get list of subjects (format: [{id, dir}...])
const subjects = getSubjects({ inputDir: inputDir });

// process subjects individually
subjects.forEach(subject => {
    //start processing subject
    logNewline();
    log(`Processing ${subject.id} [${subject.dir}]...`);

    // get asc file (edf is converted to asc)
    const ascFile = fs.readdirSync(subject.dir).find(file => file.endsWith('.asc'));
    if (!ascFile) {
        error(`no .asc file found, skipping ${subject.id}`);
        return;
    }
    const ascPath = `${subject.dir}/${ascFile}`;
    success(`asc file found: ${ascFile} [${ascPath}]`);

    // read and filter asc file
    const edfData = processAsc({ path: ascPath });
});