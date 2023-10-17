const fs = require('fs');
const parse = require('csv-parse/lib/sync');

const parseCsv = (path, delimiter) => {
    const raw = fs.readFileSync(path);
    const data = parse(raw, {
        columns: true,  
        skip_empty_lines: true,
        delimiter: delimiter
    });
    return data;
};

module.exports = parseCsv;