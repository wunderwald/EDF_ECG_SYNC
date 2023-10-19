const fs = require('fs');
const parse = require('csv-parse/lib/sync')

const adiDateToUTC = ({ date, time }) => {
    const [month, day, year] = date.split('/');
    const [hour, minute, second, _ms] = time.split('.')
        .map(s=>s.split(':'))
        .reduce((out, arr) => { 
            out.push(...arr); 
            return out; 
        } 
    );
    //parse milliseconds (i.e. 12345 => 123.45)
    const fullMs = `${_ms}`.substring(0, 3);
    const fractMs = `${_ms}`.substring(3);
    const millisecond = +`${fullMs}.${fractMs}`;

    return Date.UTC(+`${year.length==2 ? '20' : ''}${year}`, +month-1, +day, +hour, +minute, +second, +millisecond);
}

module.exports = path => {
    //read and split file by line 
    const text = fs.readFileSync(path, 'utf8');
    const lines = text.match(/[^\r\n]+/g);

    
    //replace commas by points and correct channel names
    const safeLines = lines
        .map(line => line.replace(/,/g, '.'))
        .map(line => line === 'ChannelTitle=	Channel 1	Channel 2	Channel 3	Channel 4'
            ? 'ChannelTitle=	ecg	resp	fro	matlab'
            : line
        );

    //split metadata (header) and tsv-data
    const { headerLines, dataLines } = safeLines.reduce(
        (out, line, i) => {
            line.match(/^[a-zA-Z]/) 
                ? out.headerLines.push({ line, i }) 
                : out.dataLines.push({ line, i })
            return out;
        },
        { headerLines: [], dataLines: [] }
    );

    //split data into intervals / recordings.
    //Each interval starts with a new header and starts counting time at 0.
    const recordingStartIndices = headerLines.filter(l => l.line.startsWith('Interval=')).map(l => l.i);
    const numRecordings = recordingStartIndices.length;
    const recordings = recordingStartIndices
        .reduce((recordings, startIndex, i) => {
            const endIndex = i < numRecordings-1 ? recordingStartIndices[i+1] : lines.length;
            const f = l => l.i >= startIndex && l.i < endIndex;
            const recordingHeaderLines = headerLines.filter(f);
            const recordingDataLines = dataLines.filter(f);
            recordings.push({ headerLines: recordingHeaderLines, dataLines: recordingDataLines });
            return recordings;
        }, []);


    const dataPerRecording = recordings.map((recording, recordingIndex) => {
        const { headerLines, dataLines } = recording;

        //read starttime from metadata
        const [ startDateStr, startTimeStr ] = headerLines
            .find(l => l.line.startsWith('ExcelDateTime=')).line
            .substring('ExcelDateTime='.length)
            .split('\t')[2]
            .split(' ');
        const startTimeUTC = adiDateToUTC({ date: startDateStr, time: startTimeStr });

        //parse channel title metadata (first channel is always time)
        const channelTitles = ['time', ...headerLines
            .find(l => l.line.startsWith('ChannelTitle=')).line
            .substring('ChannelTitle='.length)
            .split('\t')
            .filter(t => t !== '')
        ];

        //re-concat data body and channel titles
        const tsvBody = dataLines.reduce((body, l) => `${body}${l.line}\n`, '');
        const tsvHead = channelTitles.reduce((head, t, i) => `${head}${t}${i < channelTitles.length - 1 ? '\t' : '\n'}`, '');

        //make tsv string from titles and body
        const tsv = `${tsvHead}${tsvBody}`;
        const csv = tsv.replace(/\t/g, ',');

        //parse csv
        const records = parse(csv, { columns: true, skip_empty_lines: true,  });

        //convert data to numeric
        const data = records.map(r => {
            channelTitles.forEach(ch => r[ch] = +r[ch]);
            return r;
        });

        return { recordingIndex, data, startTimeUTC };
    });

    return dataPerRecording
};
