const convertStringToAsset = require('./lib/convert-string-to-asset');

const { USE_CDN } = process.env;

module.exports = class ClosurePlugin {
  constructor() {}

  apply(compiler) {
    const { publicPath } = compiler.options.output;

    if (USE_CDN) {
      // manifest.json must be same-origin
      compiler.hooks.compilation.tap(this.constructor.name, compilation => {
        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(
          this.constructor.name,
          (html, cb) => {
            const manifest = html.head.find(
              ({ tagName, attributes }) => tagName === 'link' && attributes.rel === 'manifest',
            );
            if (manifest) {
              manifest.attributes.href = manifest.attributes.href.replace(publicPath, '');
              delete manifest.attributes.crossorigin;
            }
            cb(null, html);
          },
        );
      });
    }

    compiler.hooks.emit.tapPromise(this.constructor.name, async compilation => {
      if (USE_CDN) {
        // modify precache-manifest.js
        const precacheFilename = Object.keys(compilation.assets).find(name =>
          /^precache-manifest(\..+)?\.js$/.test(name),
        );
        if (compilation.assets[precacheFilename]) {
          const precacheFile = compilation.assets[precacheFilename]
            .source()
            .replace(/"[^"]+\.(?:html|worker\.js)"/g, match => match.replace(publicPath, ''));
          compilation.assets[precacheFilename] = convertStringToAsset(precacheFile);
        }
      }

      // modify service-worker.js
      // const swFilename = 'service-worker.js';
      // if (compilation.assets[swFilename]) {
      //   const swFile = compilation.assets[swFilename]
      //     .source()
      //     .replace(
      //       /https:\/\/storage\.googleapis\.com\/workbox-cdn\/releases\/([^/]+)\//g,
      //       'https://cdn.jsdelivr.net/npm/workbox-cdn@$1/workbox/',
      //     );
      //   compilation.assets[swFilename] = convertStringToAsset(swFile);
      // }
    });
  }
};
