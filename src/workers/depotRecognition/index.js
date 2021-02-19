/* global _, Jimp, JSZip */
/** @typedef {import('jimp')} Jimp */

import ITEM_ORDER from '@/data/itemOrder';
import ITEM_PKG from 'file-loader?name=assets/pkg/item.[md5:hash:hex:8].[ext]!@/assets/pkg/item.zip';

import { fromUint8Array } from 'js-base64';
import { itemDetection } from './itemDetection';
import { splitNumbers, recognizeNumbers } from './number';
import { getSims } from './similarity';

const _importScripts = urls => urls.forEach(url => self.importScripts(url));
_importScripts([
  'https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js',
  'https://cdn.jsdelivr.net/npm/simple-statistics@7.1.0/dist/simple-statistics.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.5/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/arkntools-scripts@1.0.2/dist/ocrad.js',
  'https://cdn.jsdelivr.net/npm/arkntools-scripts@1.0.2/dist/jimp.js',
]);

Jimp.prototype.toBase64 = function () {
  return this.getBase64Async(Jimp.AUTO);
};

const IMG_SL = 100;

const IMG_ORIG_SL = 183;
const IMG_CROP_SL = 151;
const IMG_CROP_XY = (IMG_ORIG_SL - IMG_CROP_SL) / 2;

const NUM_MASK_IMG = new Jimp(54, 28, 'white');
const NUM_MASK_X = 39;
const NUM_MASK_Y = 70;

export const setTest = isTest => {
  self.IS_TEST = isTest;
};

export const prepareLS = ls => {
  const drPkgHash = _.last(_.initial(ITEM_PKG.split('.')));
  const loadDrPkg = async () => {
    const url = ITEM_PKG.startsWith('http') ? ITEM_PKG : `../../${ITEM_PKG}`;
    const ab = await fetch(url, { mode: 'cors' }).then(r => r.arrayBuffer());
    const b64 = fromUint8Array(new Uint8Array(ab));
    ls.setItem('dr.pkg.data', b64).then(() => ls.setItem('dr.pkg.hash', drPkgHash));
    return JSZip.loadAsync(ab);
  };
  self.getDrPkg = async () => {
    const b64 =
      (await ls.getItem('dr.pkg.hash')) === drPkgHash && (await ls.getItem('dr.pkg.data'));
    if (b64) {
      try {
        return await JSZip.loadAsync(b64, { base64: true });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
    return loadDrPkg();
  };
};

// 加载所有素材图片
let loadedResource = null;
const loadResource = async () => {
  const zip = await self.getDrPkg();
  /** @type {Jimp[]} */
  const items = await Promise.all(
    ITEM_ORDER.map(async id => Jimp.read(await zip.file(`${id}.png`).async('arraybuffer'))),
  );
  loadedResource = {
    itemImgs: _.zip(
      ITEM_ORDER,
      items.map(item =>
        item
          .crop(IMG_CROP_XY, IMG_CROP_XY, IMG_CROP_SL, IMG_CROP_SL)
          .resize(IMG_SL, IMG_SL, Jimp.RESIZE_BEZIER)
          .composite(NUM_MASK_IMG, NUM_MASK_X, NUM_MASK_Y)
          .circle(),
      ),
    ),
  };
  return loadedResource;
};

export const recognize = async (fileURL, updateProgress) => {
  const testImgs = [];

  // 加载
  updateProgress('Loading resources');
  const [origImg, { itemImgs }] = await Promise.all([
    Jimp.read(fileURL),
    loadedResource || loadResource(),
  ]);

  // 切图
  updateProgress('Processing images');
  const { posisions, itemWidth, testImgs: itemDetectionTestImgs } = itemDetection(origImg);
  if (self.IS_TEST) testImgs.push(...itemDetectionTestImgs);
  const splitedImgs = posisions.map(({ pos: { x, y } }) =>
    origImg.clone().crop(x, y, itemWidth, itemWidth),
  );
  const compareImgs = splitedImgs.map(img =>
    img.clone().resize(IMG_SL, IMG_SL).composite(NUM_MASK_IMG, NUM_MASK_X, NUM_MASK_Y).circle(),
  );

  // 相似度计算
  updateProgress('Calculating similarity');
  const simResults = getSims(compareImgs, itemImgs);

  // 切数字图
  updateProgress('Processing number images');
  const numImgs = splitNumbers({ splitedImgs, itemWidth, simResults, IMG_SL });

  // 识别数字
  updateProgress('Recognizing numbers');
  const numResults = await recognizeNumbers(numImgs);

  return {
    data: _.merge(
      posisions,
      simResults.map(sim => ({ sim })),
      numResults.map(num => ({ num })),
    ),
    test: await Promise.all(testImgs.map(img => img.toBase64())),
  };
};
