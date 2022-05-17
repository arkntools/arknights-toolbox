import { transfer } from 'comlink';
self.importScripts('https://unpkg.com/@arkntools/scripts@1.1.1/dist/jimp4worker.js');

/** @typedef {import('Jimp')} Jimp */
/** @type {typeof import('Jimp')} */
const Jimp = self.Jimp;

const THRESHOLD_MAX = 64;
const SQUARE_RATIO = 3.1;

export const getCombinedTagImg = async (...jimpArgs) => {
  const img = await Jimp.read(...jimpArgs);
  let rects = getSquareRect(img);
  const middleW = (a => a[Math.floor(a.length / 2)])(rects.map(r => r.w).sort());
  rects = rects.filter(r => r.w - middleW < middleW * 0.1);
  const squareMaxW = Math.max(...rects.map(r => r.w));
  const squareTotalH = rects.reduce((s, r) => s + r.h, 0);
  const squareImgs = rects.map(r => img.clone().crop(r.x, r.y, r.w, r.h));
  const combineImg = new Jimp(squareMaxW, squareTotalH, 0xff);
  squareImgs.reduce((curY, squareImg) => {
    combineImg.blit(squareImg, 0, curY);
    return curY + squareImg.getHeight();
  }, 0);
  combineImg.invert().scale(2, Jimp.RESIZE_BEZIER);
  const data = await combineImg.getBufferAsync(Jimp.MIME_PNG);
  return transfer(data, [data.buffer]);
};

/**
 * @param {Jimp} img
 * @returns {Array<{ x: number, y: number, w: number, h: number }>}
 */
const getSquareRect = img => {
  img = img
    .clone()
    .threshold({ max: THRESHOLD_MAX })
    .invert()
    .threshold({ max: THRESHOLD_MAX, autoGreyscale: false });

  const w = img.getWidth();
  const h = img.getHeight();

  const usedIdxSet = new Set();
  const tagMinW = w * 0.1;

  const results = [];

  img.scan(0, 0, w, h, (curX, curY, curIdx) => {
    const isWhite = img.bitmap.data[curIdx] === 255;
    if (!isWhite || usedIdxSet.has(curIdx)) return;

    // 找最大XY
    let maxX = (() => {
      const testYs = Array.from(
        Array(Math.min(5, h - curY))
          .fill()
          .keys(),
      ); // 容错
      for (let x = curX + 1; x < w; x++) {
        const idx = img.getPixelIndex(x, curY);
        if (
          x === curX + 1
            ? img.bitmap.data[idx] !== 255
            : testYs.every(i => img.bitmap.data[idx + i * w * 4] !== 255)
        ) {
          return x;
        }
      }
      return w;
    })();
    let maxY = (() => {
      const testXs = Array.from(
        Array(Math.min(5, w - curX))
          .fill()
          .keys(),
      ); // 容错
      for (let y = curY + 1; y < h; y++) {
        const idx = img.getPixelIndex(curX, y);
        if (
          y === curY + 1
            ? img.bitmap.data[idx] !== 255
            : testXs.every(i => img.bitmap.data[idx + i * 4] !== 255)
        ) {
          return y;
        }
      }
      return h;
    })();

    // 记录已用
    let isStacked = false;
    for (let y = curY; y < maxY; y++) {
      for (let x = curX; x < maxX; x++) {
        const idx = img.getPixelIndex(x, y);
        if (usedIdxSet.has(idx)) {
          isStacked = true;
          continue;
        }
        usedIdxSet.add(idx);
      }
    }
    if (isStacked) return;

    // 更新最大可用XY
    let maxW = maxX - curX;
    let maxH = maxY - curY;
    if (maxW < tagMinW) return;
    if (maxH * SQUARE_RATIO > maxW) {
      maxH = Math.floor(maxW / SQUARE_RATIO);
      maxY = curY + maxH;
    } else {
      maxW = Math.floor(maxH * SQUARE_RATIO);
      if (maxW < tagMinW) return;
      maxX = curX + maxW;
    }

    // 找到闭合矩形
    const testAllWhite = (() => {
      const testMaxPadding = Math.floor(maxH * 0.1);
      for (let testPadding = 0; testPadding < testMaxPadding; testPadding++) {
        const testMaxX = maxX - testPadding;
        const testMaxY = maxY - testPadding;
        const testWhite = (() => {
          for (let x = testMaxX - 1; x >= curX; x--) {
            const idx = img.getPixelIndex(x, testMaxY);
            if (img.bitmap.data[idx] !== 255) {
              return false;
            }
          }
          for (let y = testMaxY - 2; y >= curY; y--) {
            const idx = img.getPixelIndex(testMaxX, y);
            if (img.bitmap.data[idx] !== 255) {
              return false;
            }
          }
          return true;
        })();
        if (testWhite) return true;
      }
      return false;
    })();
    if (!testAllWhite) return;

    results.push({
      x: curX,
      y: curY,
      w: maxW,
      h: maxH,
    });
  });

  return results;
};
