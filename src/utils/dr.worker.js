/* eslint-disable no-undef */
import { isTrustSim } from './dr.trustSim';
import ITEM_ORDER from '@/data/itemOrder';
import ITEM_PKG from 'file-loader?name=assets/pkg/item.[md5:hash:hex:8].[ext]!@/assets/pkg/item.zip';
import { fromUint8Array } from 'js-base64';

const _importScripts = urls => urls.forEach(url => self.importScripts(url));
_importScripts([
  'https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js',
  'https://cdn.jsdelivr.net/npm/simple-statistics@7.1.0/dist/simple-statistics.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.5/dist/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/arkntools-scripts@1.0.2/dist/ocrad.js',
  'https://cdn.jsdelivr.net/npm/arkntools-scripts@1.0.2/dist/jimp.js',
]);

const IMG_SL = 100;
const IMG_SL_HALF = Math.floor(IMG_SL / 2);
const IMG_PADDING = 6;
const IMG_MARGIN = 10;
const IMG_CTX_SL = 83;
const IMG_ROW_NUM = 3;
const SS_HEIGHT = 507;
const SS_TOP = 84;
const SS_BOTTOM = 56;
const NUM_X = 43;
const NUM_Y = 70;
const NUM_W = 39;
const NUM_H = 17;
const NUM_RESIZE_H = 60;
const NUM_MIN_WIDTH = NUM_RESIZE_H / 5;

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
    const b64 = (await ls.getItem('dr.pkg.hash')) === drPkgHash && (await ls.getItem('dr.pkg.data'));
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
  const [items, itemNumMask] = await Promise.all([
    Promise.all(ITEM_ORDER.map(async id => Jimp.read(await zip.file(`${id}.png`).async('arraybuffer')))),
    Jimp.read(await zip.file('item-num-mask.png').async('arraybuffer')),
  ]);
  loadedResource = {
    itemImgs: _.zip(
      ITEM_ORDER,
      items.map(item =>
        item
          .resize(IMG_SL, IMG_SL, Jimp.RESIZE_BEZIER)
          .composite(itemNumMask, 0, 0)
          .circle({ radius: IMG_SL / 2 - IMG_PADDING })
      )
    ),
    itemNumMask,
  };
  return loadedResource;
};

/**
 * 初步处理
 *
 * @param {Jimp} img
 */
const init = img => {
  const tpl = img.clone().resize(Jimp.AUTO, SS_HEIGHT, Jimp.RESIZE_BEZIER);
  return {
    tpl,
    gimg: tpl
      .clone()
      .crop(0, SS_TOP, tpl.getWidth(), tpl.getHeight() - SS_TOP - SS_BOTTOM)
      .greyscale()
      .convolution([
        [1, 1, 1],
        [1, -9, 1],
        [1, 1, 1],
      ]),
  };
};

/**
 * 分割行
 *
 * @param {Jimp} img
 */
const splitRow = img => {
  const space = Math.floor((img.getHeight() - IMG_ROW_NUM * IMG_SL) / 2);
  const tops = [0, IMG_SL + space, img.getHeight() - IMG_SL];
  return {
    tops,
    rows: tops.map(top => img.clone().crop(0, top, img.getWidth(), IMG_SL)),
  };
};

/**
 * 该列是否不算素材
 *
 * @param {Jimp} img
 * @param {Number} x
 */
const isColNotItem = (img, x) => {
  let sum = 0;
  for (let y = 0; y < img.getHeight(); y++) {
    const { r } = Jimp.intToRGBA(img.getPixelColor(x, y));
    sum += r;
  }
  return sum <= 127;
};

/**
 * 去除噪点
 *
 * @param {Array} range
 * @return {{ start: number, length: number }[]}
 */
const removeRangesNoise = (range, size = 1) => _.remove(range, ({ length }) => length <= size);

/**
 * 反向范围
 *
 * @param {Array} range
 * @param {Number} width
 * @return {{ start: number, length: number }[]}
 */
const reverseRanges = (range, width) => {
  const rr = [{ start: 0, length: width }];
  range.forEach(({ start, length }) => {
    const last = _.last(rr);
    if (start === last.start) {
      last.start += length;
      last.length -= length;
    } else {
      const newStart = start + length;
      const newLength = last.start + last.length - newStart;
      if (newLength > 0) {
        rr.push({
          start: newStart,
          length: newLength,
        });
      }
      last.length = start - last.start;
    }
  });
  return rr;
};

/**
 * 获取黑色列范围
 *
 * @param {Jimp} img
 * @param {Function} fn
 * @returns {{ start: number, length: number }[]}
 */
const getBlackColRanges = (img, fn) => {
  const blackArr = [];
  for (let x = 0; x < img.getWidth(); x++) {
    blackArr.push(fn(img, x));
  }
  return _.transform(
    blackArr,
    (a, isBlack, x) => {
      if (!a.length) {
        if (isBlack) a.push({ start: x, length: 1 });
        return;
      }
      if (isBlack) {
        const last = _.last(a);
        if (x === last.start + last.length) last.length++;
        else a.push({ start: x, length: 1 });
      }
    },
    []
  );
};

/**
 * 获取素材列范围
 *
 * @param {Jimp} img
 * @returns {{ start: number, length: number }[]}
 */
const getColRanges = img => {
  const blackRange = getBlackColRanges(img, isColNotItem);
  removeRangesNoise(blackRange);
  const whiteRange = reverseRanges(blackRange, img.getWidth()).filter(({ start }) => start !== 0);
  whiteRange.forEach(range => {
    range.deviation = Math.abs(IMG_CTX_SL - range.length);
    range.center = Math.floor(range.start + range.length / 2);
    range.col = Math.floor(range.center / (IMG_SL + IMG_MARGIN));
  });
  return whiteRange;
};

/**
 * 线性回归得到每列位置
 *
 * @param {Array} colsRanges
 * @param {Number} gimgW
 */
const getColPosTable = (colsRanges, gimgW) => {
  const points = _.flatten(colsRanges)
    .filter(({ deviation }) => deviation <= 3)
    .map(({ center, col }) => [col, center]);
  const { m, b } = ss.linearRegression(points);
  return _.range(Math.floor(gimgW / m))
    .map(col => {
      const center = Math.floor(col * m + b);
      return { x: center - IMG_SL_HALF, cx: center };
    })
    .filter(({ x, cx }) => x >= 0 && cx + IMG_SL_HALF <= gimgW);
};

/**
 * 相似度计算
 *
 * @param {Jimp} input
 * @param {[string, Jimp][]} compares
 * @returns {{ name: string, diff: number, diffs: [string, number][] }}
 */
const getSim = (input, compares) => {
  if (!compares.length) return null;
  const diffs = _.sortBy(
    compares.map(([id, img]) => [id, Jimp.diff(input, img, 0.2).percent]),
    1
  );
  const [name, diff] = diffs[0];
  return { name, diff, diffs };
};

/**
 * 相似度组计算
 *
 * @param {Jimp[]} inputs
 * @param {[string, Jimp][]} compares
 * @returns {{ name: string, diff: number, diffs: [string, number][] }[]}
 */
const getSims = (inputs, compares) => {
  if (inputs.length <= 2) {
    return inputs.map(input => getSim(input, compares));
  }
  const inputCenterI = Math.floor(inputs.length / 2);
  const inputCenterSim = getSim(inputs[inputCenterI], compares);
  if (isTrustSim(inputCenterSim)) {
    // 受信结果
    const compareCenterI = compares.findIndex(([name]) => name === inputCenterSim.name);
    return [
      ...getSims(inputs.slice(0, inputCenterI), compares.slice(0, compareCenterI)),
      inputCenterSim,
      ...getSims(inputs.slice(inputCenterI + 1), compares.slice(compareCenterI + 1)),
    ];
  } else {
    // 不受信结果
    const leftSims = getSims(inputs.slice(0, inputCenterI), compares);
    const leftLastTrusted = _.findLast(leftSims, sim => sim);
    const rightSims = getSims(
      inputs.slice(inputCenterI + 1),
      leftLastTrusted ? compares.slice(compares.findIndex(([name]) => name === leftLastTrusted.name) + 1) : compares
    );
    return [...leftSims, inputCenterSim, ...rightSims];
  }
};

/**
 * 该列是否有黑色像素
 *
 * @param {Jimp} img
 * @param {Number} x
 */
const isColHasBlack = (img, x) => {
  for (let y = 0; y < img.getHeight(); y++) {
    const { r } = Jimp.intToRGBA(img.getPixelColor(x, y));
    if (r !== 255) return true;
  }
  return false;
};

export const recognize = async (fileURL, updateProgress) => {
  // 加载
  updateProgress('Loading resources');
  const [origImg, { itemImgs, itemNumMask }] = await Promise.all([
    Jimp.read(fileURL),
    loadedResource || loadResource(),
  ]);

  // 初始化
  updateProgress('Initializing');
  const { tpl, gimg } = init(origImg);

  // 切图
  updateProgress('Processing images');
  const gimgW = gimg.getWidth();
  const { rows, tops } = splitRow(gimg);
  const colsRanges = rows.map(row => getColRanges(row));
  const colPosTable = getColPosTable(colsRanges, gimgW);
  const posisions = (() => {
    const possTable = _.flatten(
      _.zip(
        ...colsRanges.map((colRanges, row) =>
          colPosTable.map(colPos => ({
            ...colPos,
            row,
            hasItem: colRanges.some(({ start, length }) => start < colPos.cx && colPos.cx < start + length),
          }))
        )
      )
    );
    const startPoss = possTable.findIndex(({ hasItem }) => hasItem);
    const endPoss = _.findLastIndex(possTable, ({ hasItem }) => hasItem);
    return _.map(possTable.slice(startPoss, endPoss + 1), ({ x, row }) => {
      const pos = {
        x,
        y: SS_TOP + tops[row],
      };
      const posPct = {
        top: pos.y / SS_HEIGHT,
        left: pos.x / gimgW,
        width: IMG_SL / gimgW,
        height: IMG_SL / SS_HEIGHT,
      };
      return { pos, posPct };
    });
  })();

  // 相似度计算
  updateProgress('Calculating similarity');
  const ratio = origImg.getHeight() / SS_HEIGHT;
  const compareImgs = posisions.map(({ pos: { x, y } }) =>
    tpl
      .clone()
      .crop(x, y, IMG_SL, IMG_SL)
      .composite(itemNumMask, 0, 0)
      .circle({ radius: IMG_SL / 2 - IMG_PADDING })
  );
  const simResults = getSims(compareImgs, itemImgs);

  // 切数字图
  updateProgress('Processing number images');
  const numImgs = await Promise.all(
    posisions.map(({ pos: { x, y } }, i) => {
      if (!simResults[i]) return null;
      const numImg = origImg
        .clone()
        .crop((x + NUM_X) * ratio, (y + NUM_Y) * ratio, NUM_W * ratio, NUM_H * ratio)
        .resize(Jimp.AUTO, NUM_RESIZE_H, Jimp.RESIZE_BEZIER)
        .invert()
        .threshold({ max: 72 });
      const numImgBlackRanges = getBlackColRanges(numImg, isColHasBlack);
      // 过窄块不要
      removeRangesNoise(numImgBlackRanges, NUM_MIN_WIDTH);
      // 开头贴边块不要
      if (numImgBlackRanges[0]?.start === 0) numImgBlackRanges.splice(0, 1);
      // 间距过大不要
      _.remove(numImgBlackRanges, (range, i) => {
        const next = numImgBlackRanges[i + 1];
        return next && next.start - (range.start + range.length) > NUM_RESIZE_H / 4;
      });
      const numImgLeftSide = Math.max((numImgBlackRanges[0]?.start ?? 0) - NUM_MIN_WIDTH / 2, 0);
      const numImgLastRange = _.last(numImgBlackRanges);
      const numImgRightSide = Math.min(
        (numImgLastRange ? numImgLastRange.start + numImgLastRange.length : numImg.getWidth()) + NUM_MIN_WIDTH / 2,
        numImg.getWidth()
      );
      if (numImgLeftSide > 0 || numImgRightSide < numImg.getWidth())
        numImg.crop(numImgLeftSide, 0, numImgRightSide - numImgLeftSide, numImg.getHeight());
      numImg
        .convolution([
          [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
          [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
          [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
          [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
          [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
        ])
        .invert()
        .threshold({ max: 2 })
        .invert();
      return numImg;
    })
  );

  // 识别数字
  updateProgress('Recognizing numbers');
  const numResults = await Promise.all(
    numImgs.map(async img => {
      if (!img) return null;
      const imgData = new ImageData(new Uint8ClampedArray(img.bitmap.data), img.bitmap.width, img.bitmap.height);
      const text = OCRAD(imgData, { numeric: true }).trim();
      const value = parseInt(text.replace(/_/g, 2).replace(/[^0-9]/g, '')) || 2;
      return {
        img: await img.getBase64Async(img.getMIME()),
        text,
        value,
        warn: text != value,
        edit: false,
      };
    })
  );

  return _.merge(
    posisions,
    simResults.map(sim => ({ sim })),
    numResults.map(num => ({ num }))
  );
};
