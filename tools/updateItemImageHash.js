const Path = require('path');
const Fse = require('fs-extra');
const _ = require('lodash');
const Jimp = require('jimp');

const IMG_PATH = Path.resolve(__dirname, '../public/assets/img/item/');
const IMG_SL = 100;
const IMG_PADDING = 6;

const itemIds = _.map(
  _.sortBy(
    _.mapValues(require('../src/data/item'), ({ sortId }, name) => ({ name, sortId })),
    'sortId'
  ),
  'name'
);

(async () => {
  const itemNumMask = await Jimp.read(Path.resolve(__dirname, '../public/assets/img/other/item-num-mask.png'));
  const items = await Promise.all(itemIds.map(id => Jimp.read(Path.resolve(IMG_PATH, `${id}.png`))));
  const hashs = items.map(item =>
    item
      .resize(IMG_SL, IMG_SL, Jimp.RESIZE_BEZIER)
      .composite(itemNumMask, 0, 0)
      .circle({ radius: IMG_SL / 2 - IMG_PADDING })
      .hash()
  );
  Fse.writeJsonSync(Path.resolve(__dirname, '../src/data/itemImgHash.json'), _.zip(itemIds, hashs), { spaces: 2 });
})();
