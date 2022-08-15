/* global Encoding */

let encodingJapaneseLoaded = false;
export const encodeURIComponentEUCJP = async str => {
  if (!encodingJapaneseLoaded) {
    await import(
      /* webpackIgnore: true */ 'https://fastly.jsdelivr.net/npm/encoding-japanese@2.0.0/encoding.min.js'
    );
    encodingJapaneseLoaded = true;
  }
  return Encoding.urlEncode(Encoding.convert(str, 'EUCJP', 'UNICODE'));
};
