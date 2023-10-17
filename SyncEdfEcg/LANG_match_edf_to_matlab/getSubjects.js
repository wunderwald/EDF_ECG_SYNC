const fs = require('fs');

const getSubjects = dir => fs.readdirSync(dir)
    .filter(f => fs.lstatSync(`${dir}/${f}`).isFile() && f.includes('lang') && f.includes('.csv'))
    .map(f => f.split("_")[1]);

module.exports = getSubjects;