import * as fs from 'fs';
import xlsx from 'node-xlsx';

export const parseXLS = path => xlsx.parse(fs.readFileSync(path));