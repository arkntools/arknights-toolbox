/* global _ */

/**
 * @typedef {Object} Range
 * @property {number} start
 * @property {number} length
 */

/**
 * @param {number} x
 * @param {Range} range
 */
export const inRange = (x, { start, length }) => start <= x && x < start + length;

/**
 * @param {number} x
 * @param {Range[]} ranges
 */
export const findRange = (x, ranges) => ranges.find(range => inRange(x, range));

/**
 * @param {number} x
 * @param {Range[]} ranges
 */
export const findRangeIndex = (x, ranges) => _.findIndex(ranges, range => inRange(x, range));

/**
 * @param {boolean[]} arr
 * @returns {Range[]}
 */
export const getRanges = arr =>
  _.transform(
    arr,
    (a, inRange, x) => {
      if (!a.length) {
        if (inRange) a.push({ start: x, length: 1 });
        return;
      }
      if (inRange) {
        const last = _.last(a);
        if (x === last.start + last.length) last.length++;
        else a.push({ start: x, length: 1 });
      }
    },
    [],
  );

/**
 * @param {boolean[]} arr
 * @param {number} [middle]
 */
export const getGoodRanges = (arr, middle) => {
  const range = _.sortBy(getRanges(arr), 'length').reverse();
  if (middle) {
    const min = middle * 0.9;
    const max = middle * 1.1;
    return _.sortBy(
      range.filter(({ length }) => min < length && length < max),
      'start',
    );
  }
  const min = range[0].length * 0.8;
  return _.sortBy(
    range.filter(({ length }) => length > min),
    'start',
  );
};

/**
 * @param {Range} ranges
 * @returns {Range[]}
 */
export const removeRangesNoise = (ranges, size = 1) =>
  _.remove(ranges, ({ length }) => length <= size);
