import { encode as jconvEncode } from 'jconv';

export const encodeURIComponentEUCJP = str =>
  jconvEncode(str, 'EUCJP').toString('hex').toUpperCase().replace(/.{2}/g, '%$&');
