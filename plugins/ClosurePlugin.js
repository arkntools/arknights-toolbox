const _ = require('lodash');

const PLUGIN_NAME = 'ClosurePlugin';

module.exports = class ClosurePlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      // manifest.json must be same-origin
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(PLUGIN_NAME, (html, cb) => {
        const manifest = html.head.find(
          ({ tagName, attributes }) => tagName === 'link' && attributes.rel === 'manifest'
        );
        if (manifest) {
          manifest.attributes.href = _.last(manifest.attributes.href.split('/'));
          delete manifest.attributes.crossorigin;
        }
        cb(null, html);
      });
    });
  }
};
