import JimpLib from 'file-loader?name=/assets/js/jimp4worker.[md5:hash:hex:8].[ext]!@arkntools/scripts/dist/jimp4worker.js';
self.importScripts(
  'https://code.bdstatic.com/npm/lodash@4.17.21/lodash.min.js',
  'https://lib.baomitu.com/simple-statistics/7.7.5/simple-statistics.min.js',
  'https://lib.baomitu.com/jszip/3.10.0/jszip.min.js',
  'https://code.bdstatic.com/npm/@arkntools/scripts@1.0.2/dist/ocrad.js',
  JimpLib,
);
