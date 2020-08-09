/* eslint-disable no-console */
import _ from 'lodash';
import Jimp from 'jimp/es';
import { createWorker as createTesseractWorker, createScheduler as createTesseractScheduler } from 'tesseract.js';
import { linearRegression } from 'simple-statistics';
import { materialOrder } from '../store/material';
import Timer from './timer';

const THREAD_NUM = Math.floor((navigator?.hardwareConcurrency ?? 4) / 2);

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
const NUM_RESIZE_H = 50;
const DIGIT_MIN_WIDTH = 10;
const MAX_TRUST_DIFF = 0.15;

Jimp.prototype.getBlobURL = async function () {
  const blob = new Blob([await this.getBufferAsync(this.getMIME())]);
  return window.URL.createObjectURL(blob);
};

Jimp.prototype.getImage = async function () {
  const img = new Image();
  img.src = await this.getBlobURL();
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

// 加载所有素材图片
let loadedResource;
export const loadResource = staticBaseURL => {
  loadedResource = (async () => {
    const getURL = name => `${staticBaseURL}assets/img/item/${name}.png`;
    const [items, itemNumMask] = await Promise.all([
      Promise.all(materialOrder.map(name => Jimp.read(getURL(name)))),
      Jimp.read(`${staticBaseURL}assets/img/other/item-num-mask.png`),
    ]);
    return {
      itemImgs: _.zip(
        materialOrder,
        items.map(item =>
          item
            .resize(IMG_SL, IMG_SL, Jimp.RESIZE_BEZIER)
            .composite(itemNumMask, 0, 0)
            .circle({ radius: IMG_SL / 2 - IMG_PADDING })
        )
      ),
      itemNumMask,
    };
  })();
};

const loadedTesseractScheduler = (async () => {
  const scheduler = createTesseractScheduler();
  const createWorker = async () => {
    const worker = createTesseractWorker({
      workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@2.1.1/dist/worker.min.js',
      langPath: 'https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0_fast',
      corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@2.2.0/tesseract-core.wasm.js',
    });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789',
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
    });
    return worker;
  };
  scheduler.addWorker(await createWorker());
  await Promise.all(_.range(THREAD_NUM - 1).map(async () => scheduler.addWorker(await createWorker())));
  return scheduler;
})();

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
  const { m, b } = linearRegression(points);
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
  return diff <= MAX_TRUST_DIFF ? { name, diff, diffs } : null;
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
  if (inputCenterSim) {
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

export const recognize = async fileURL => {
  const timer = new Timer();

  const [origImg, { itemImgs, itemNumMask }] = await Promise.all([Jimp.read(fileURL), loadedResource]);
  timer.step('加载图片');

  // 得到相对准确的列信息
  const { tpl, gimg } = init(origImg);
  timer.step('初始处理');
  const gimgW = gimg.getWidth();
  const { rows, tops } = splitRow(gimg);
  const colsRanges = rows.map(row => getColRanges(row));
  const colPosTable = getColPosTable(colsRanges, gimgW);
  timer.step('计算列信息');

  // 定位素材
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
  const ratio = origImg.getHeight() / SS_HEIGHT;
  const compareImgs = posisions.map(({ pos: { x, y } }) =>
    tpl
      .clone()
      .crop(x, y, IMG_SL, IMG_SL)
      .composite(itemNumMask, 0, 0)
      .circle({ radius: IMG_SL / 2 - IMG_PADDING })
  );
  const simResults = getSims(compareImgs, itemImgs);
  timer.step('相似度计算');

  // 数字识别
  const numImgs = posisions.map(({ pos: { x, y } }, i) => {
    if (!simResults[i]) return null;
    const numImg = origImg
      .clone()
      .crop((x + NUM_X) * ratio, (y + NUM_Y) * ratio, NUM_W * ratio, NUM_H * ratio)
      .resize(Jimp.AUTO, NUM_RESIZE_H, Jimp.RESIZE_BEZIER)
      .invert()
      .threshold({ max: 72 });
    const numImgBlackRanges = getBlackColRanges(numImg, isColHasBlack);
    removeRangesNoise(numImgBlackRanges, DIGIT_MIN_WIDTH);
    if (numImgBlackRanges[0]?.start === 0) numImgBlackRanges.splice(0, 1);
    const numImgLeftSide = Math.max((numImgBlackRanges[0]?.start ?? 0) - DIGIT_MIN_WIDTH / 2, 0);
    const numImgLastRange = _.last(numImgBlackRanges);
    const numImgRightSide = Math.min(
      (numImgLastRange ? numImgLastRange.start + numImgLastRange.length : numImg.getWidth()) + DIGIT_MIN_WIDTH / 2,
      numImg.getWidth()
    );
    if (numImgLeftSide > 0 || numImgRightSide < numImg.getWidth())
      numImg.crop(numImgLeftSide, 0, numImgRightSide - numImgLeftSide, numImg.getHeight());
    return numImg;
  });
  const scheduler = await loadedTesseractScheduler;
  const numResults = (
    await Promise.all(
      numImgs.map(async img => img && scheduler.addJob('recognize', await img.getBase64Async(img.getMIME())))
    )
  ).map(ocr => ocr?.data?.text?.trim() ?? null);
  timer.step('数字识别');

  // const test = numImgs;
  const test = [];

  return {
    data: _.merge(
      posisions,
      simResults.map(sim => ({ sim })),
      numResults.map(num => ({ num }))
    ),
    test: await Promise.all(test.map(img => img.getBase64Async(img.getMIME()))),
    time: timer.getResult(),
  };
};
