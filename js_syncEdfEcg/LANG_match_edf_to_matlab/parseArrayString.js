const parseArrayString = arrayString => arrayString.replace('[', '').replace(']', '').split(',');
module.exports = parseArrayString;