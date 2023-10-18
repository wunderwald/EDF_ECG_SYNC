const LOG = true;

export const log = msg => LOG && console.log(`👀 ${msg}`);
export const success = msg => LOG && console.log(`🥰 ${msg}`);
export const warn = msg => LOG && console.log(`😳 ${msg}`);
export const error = msg => LOG && console.log(`🤬 ${msg}`);
export const logNewline = () => LOG && console.log();