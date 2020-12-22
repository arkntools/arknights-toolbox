const convertStringToAsset = require('./lib/convert-string-to-asset');

module.exports = class PreventVercelBuildingPlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.emit.tapPromise(this.constructor.name, async compilation => {
      compilation.assets['vercel.json'] = convertStringToAsset(JSON.stringify({ github: { enabled: false } }));
    });
  }
};
