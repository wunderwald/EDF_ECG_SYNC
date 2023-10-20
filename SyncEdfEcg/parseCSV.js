import { parse } from 'csv-parse/sync';
export const parseCSV = ({ csvData }) => parse(csvData, { columns: true, skip_empty_lines: true });