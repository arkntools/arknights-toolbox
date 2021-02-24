const base62 = require('base-x')('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

const UUID_ENCODING = 'hex';
const UUID_LENGTH = 32;
const UUID_BLOCKS = [[0, 8], [8, 4], [12, 4], [16, 4], [20]];

/**
 * @param {string} input
 * @param {number} length
 */
const ensureLength = (input, length) => input.slice(-length).padStart(length, '0');

/**
 * @param {string} input
 */
const encode = input => {
  const buffer = Buffer.from(input.replace(/-/g, ''), UUID_ENCODING);
  return base62.encode(buffer);
};

/**
 * @param {string} input
 */
const decode = input => {
  const uuid = ensureLength(Buffer.from(base62.decode(input)).toString(UUID_ENCODING), UUID_LENGTH);
  return UUID_BLOCKS.map(args => uuid.substr(...args)).join('-');
};

export default {
  encode,
  decode,
};
