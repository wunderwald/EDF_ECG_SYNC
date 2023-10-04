import * as fs from 'fs';

export const processAsc = ({ path }) => {
    const content = fs.readFileSync(path, { encoding: 'utf-8' });
    console.log(content);
}