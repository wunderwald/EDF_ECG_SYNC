import * as fs from 'fs';
import xlsx from 'node-xlsx';

export const parseXLS = ({ path }) => {
    const xlsData = xlsx.parse(fs.readFileSync(path));
    const columns = xlsData[0].data[0];
    const xlsDataNamed = xlsData[0].data.reduce((out, row, rowIndex) => {
        if (rowIndex === 0) return out;
        out.push(columns.reduce((newRow, columnId, columnIndex) => {
            newRow[columnId] = row[columnIndex];
            return newRow;
        }, ({})));
        return out;
    }, []);
    return xlsDataNamed;
};