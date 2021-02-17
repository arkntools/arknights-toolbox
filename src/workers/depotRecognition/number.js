/* global _, Jimp, OCRAD */
/** @typedef {import('jimp')} Jimp */

import { getRanges, removeRangesNoise } from './range';

const NUM_RESIZE_H = 60;
const NUM_MIN_WIDTH = NUM_RESIZE_H / 5;

const NUM_CROP_W = 48;
const NUM_CROP_H = 22;
const NUM_CROP_X = 40;
const NUM_CROP_Y = 73;

const NUM_CONVOLUTION_CORE = (line => new Array(5).fill(line))(new Array(5).fill(1 / 25));

/**
 * 获取黑色列范围
 *
 * @param {Jimp} img
 * @param {Function} fn
 */
const getBlackColRanges = (img, fn) => {
  const blackArr = [];
  for (let x = 0; x < img.getWidth(); x++) {
    blackArr.push(fn(img, x));
  }
  return getRanges(blackArr);
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

/**
 * @returns {Jimp[]}
 */
export const splitNumbers = ({ splitedImgs, itemWidth, simResults, IMG_SL }) => {
  const numRatio = itemWidth / IMG_SL;
  const numX = Math.round(NUM_CROP_X * numRatio);
  const numY = Math.round(NUM_CROP_Y * numRatio);
  const numW = Math.round(NUM_CROP_W * numRatio);
  const numH = Math.round(NUM_CROP_H * numRatio);
  return splitedImgs.map((splitedImg, i) => {
    if (!simResults[i]) return null;
    const numImg = splitedImg
      .clone()
      .crop(numX, numY, numW, numH)
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
      (numImgLastRange ? numImgLastRange.start + numImgLastRange.length : numImg.getWidth()) +
        NUM_MIN_WIDTH / 2,
      numImg.getWidth(),
    );
    if (numImgLeftSide > 0 || numImgRightSide < numImg.getWidth())
      numImg.crop(numImgLeftSide, 0, numImgRightSide - numImgLeftSide, numImg.getHeight());
    numImg.convolution(NUM_CONVOLUTION_CORE).invert().threshold({ max: 2 }).invert();
    return numImg;
  });
};

/**
 * @param {Jimp[]} numImgs
 */
export const recognizeNumbers = numImgs => {
  return Promise.all(
    numImgs.map(async img => {
      if (!img) return null;
      const imgData = new ImageData(
        new Uint8ClampedArray(img.bitmap.data),
        img.bitmap.width,
        img.bitmap.height,
      );
      const text = OCRAD(imgData, { numeric: true }).trim();
      const value = parseInt(text.replace(/_/g, 2).replace(/[^0-9]/g, '')) || 2;
      return {
        img: await img.getBase64Async(Jimp.AUTO),
        text,
        value,
        warn: text != value,
        edit: false,
      };
    }),
  );
};
