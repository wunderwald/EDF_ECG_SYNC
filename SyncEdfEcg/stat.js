export const mean = arr => arr.reduce((sum, el) => sum + el, 0) / arr.length;
export const min = arr => arr.reduce((currMin, el) => el < currMin ? el : currMin, Number.POSITIVE_INFINITY);
export const max = arr => arr.reduce((currMax, el) => el > currMax ? el : currMax, Number.NEGATIVE_INFINITY);