const _importScripts = urls => urls.forEach(url => self.importScripts(url));
_importScripts([
  'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  'https://cdn.jsdelivr.net/npm/simple-statistics@7.5.0/dist/simple-statistics.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/arkntools-scripts@1.0.2/dist/ocrad.js',
  'https://cdn.jsdelivr.net/npm/arkntools-scripts@1.0.2/dist/jimp.js',
]);

Jimp.prototype.toBase64 = function () {
  return this.getBase64Async(Jimp.AUTO);
};
