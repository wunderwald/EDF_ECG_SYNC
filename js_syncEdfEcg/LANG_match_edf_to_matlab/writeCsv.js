const fs = require('fs');
const writeCsv = (path, data, cols, delimiter) => {
    const header = cols.join(delimiter);
    const rows = data.map(o => cols.map(col => o[col]).join(delimiter));
    const body = rows.join('\n');
    const csv = `${header}\n${body}`;
    fs.writeFileSync(path, csv);
}
module.exports = writeCsv;