const B62 = require('base-x')('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

export default {
  encode: hex => B62.encode(Buffer.from(hex, 'hex')),
  decode: b62 => B62.decode(b62).toString('hex'),
};
