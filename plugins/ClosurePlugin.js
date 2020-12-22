const convertStringToAsset = require('./lib/convert-string-to-asset');

module.exports = class ClosurePlugin {
  constructor() {}

  apply(compiler) {
    const { publicPath } = compiler.options.output;

    // manifest.json must be same-origin
    compiler.hooks.compilation.tap(this.constructor.name, compilation => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(this.constructor.name, (html, cb) => {
        const manifest = html.head.find(
          ({ tagName, attributes }) => tagName === 'link' && attributes.rel === 'manifest'
        );
        if (manifest) {
          manifest.attributes.href = manifest.attributes.href.replace(publicPath, '');
          delete manifest.attributes.crossorigin;
        }
        cb(null, html);
      });
    });

    // modify precache-manifest.js
    compiler.hooks.emit.tapPromise(this.constructor.name, async compilation => {
      const precacheFilename = Object.keys(compilation.assets).find(name =>
        /^precache-manifest(\..+)?\.js$/.test(name)
      );
      const precacheFile = compilation.assets[precacheFilename]
        .source()
        .replace(/"[^"]+\.(?:html|worker\.js)"/g, match => match.replace(publicPath, ''));
      compilation.assets[precacheFilename] = convertStringToAsset(precacheFile);
    });
  }
};
