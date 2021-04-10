import './requirements';
import { fromUint8Array } from 'js-base64';
import { itemDetection } from './itemDetection';
import { splitNumbers, recognizeNumbers } from './number';
import { getSims } from './similarity';

import ITEM_ORDER from '@/data/itemOrder.json';
import ITEM_PKG from 'file-loader?name=assets/pkg/item.[md5:hash:hex:8].[ext]!@/assets/pkg/item.zip';

const IMG_SL = 100;

const IMG_ORIG_SL = 183;
const IMG_CROP_SL = 151;
const IMG_CROP_XY = (IMG_ORIG_SL - IMG_CROP_SL) / 2;

const NUM_MASK_IMG = new Jimp(54, 28, 'white');
const NUM_MASK_X = 39;
const NUM_MASK_Y = 70;

export const setTest = isTest => {
  self.IS_DEBUG = isTest;
};

/**
 * @param {Storage} ls
 */
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
const loadResource = (() => {
  /** @type {[string, Jimp][]} */
  let loadedResource = null;
  return async () => {
    if (loadedResource) return loadedResource;
    const zip = await self.getDrPkg();
    const items = await Promise.all(
      ITEM_ORDER.map(async id => Jimp.read(await zip.file(`${id}.png`).async('arraybuffer'))),
    );
    loadedResource = _.zip(
      ITEM_ORDER,
      items.map(item =>
        item
          .crop(IMG_CROP_XY, IMG_CROP_XY, IMG_CROP_SL, IMG_CROP_SL)
          .resize(IMG_SL, IMG_SL, Jimp.RESIZE_BEZIER)
          .composite(NUM_MASK_IMG, NUM_MASK_X, NUM_MASK_Y)
          .circle(),
      ),
    );
    return loadedResource;
  };
})();

/**
 * @param {string} fileURL
 * @param {(text: string) => void} updateProgress
 * @returns
 */
export const recognize = async (fileURL, updateProgress) => {
  const testImgs = [];

  // 加载
  updateProgress('Loading resources');
  const [origImg, itemImgs] = await Promise.all([Jimp.read(fileURL), loadResource()]);

  // 切图
  updateProgress('Processing images');
  const { posisions, itemWidth, testImgs: itemDetectionTestImgs } = itemDetection(origImg);
  if (self.IS_DEBUG) testImgs.push(...itemDetectionTestImgs);
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
