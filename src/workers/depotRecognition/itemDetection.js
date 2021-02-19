/* global _, ss */
/** @typedef {import('jimp')} Jimp */

import { getGoodRanges, findRangeIndex } from './range';

const ITEM_VIEW_SCALE = 1.15;
const ITEM_DEBUG_VIEW_W = 60;
const ITEM_X_SPACE_RATIO = 57 / 177;
// const ITEM_Y_SPACE_RATIO = 107.5 / 177;

/**
 * 检测素材位置
 *
 * @param {Jimp} img
 */
export const itemDetection = img => {
  /**
   * 得到比较标准的若干个素材位置
   */

  const edgeImg = img
    .clone()
    .greyscale()
    .convolution([
      [1, 1, 1],
      [1, -9, 1],
      [1, 1, 1],
    ]);
  const width = edgeImg.getWidth();
  const height = edgeImg.getHeight();

  const yWhite = new Array(height).fill(0);
  const removedEdgeWith = Math.round(width * 0.15); // 去除可能的干扰
  edgeImg.scan(removedEdgeWith, 0, width - removedEdgeWith, height, function (x, y, idx) {
    yWhite[y] += this.bitmap.data[idx];
  });
  const yRanges = getGoodRanges(yWhite.map(v => v / 255 > width * 0.005));
  // const itemWidth = ss.median(_.map(yRanges, 'length'));
  let itemWidth = _.minBy(yRanges, 'length').length; // 最小值一般为极限高度，和真正边长最接近

  const xWhites = yRanges.map(() => new Array(width).fill(0));
  edgeImg.scan(0, 0, width, height, function (x, y, idx) {
    const yRangeIndex = findRangeIndex(y, yRanges);
    if (yRangeIndex !== -1) xWhites[yRangeIndex][x] += this.bitmap.data[idx];
  });
  const xRangess = xWhites.map(xWhite =>
    getGoodRanges(
      xWhite.map(v => v / 255 > 0),
      itemWidth,
    ),
  );
  const xItemWidths = _.map(_.flatten(xRangess), 'length').filter(
    w => w < itemWidth && 1 - w / itemWidth < 0.05,
  );
  if (xItemWidths.length) {
    itemWidth = _.min(xItemWidths); // 更新真正边长
  }

  /**
   * 素材位置的线性回归
   */

  const xOccu = itemWidth * (1 + ITEM_X_SPACE_RATIO);
  // const yOccu = itemWidth * (1 + ITEM_Y_SPACE_RATIO);
  const xPoints = _.flatten(xRangess).map(({ start, length }) => {
    const y = start + length / 2;
    const x = Math.floor(y / xOccu);
    return [x, y];
  });
  const yPoints = yRanges.map(({ start, length }, x) => {
    // 大部分比较高的素材都是顶部突出导致，因此中心点直接按底部为准处理
    const offset = length - itemWidth;
    const y = start + (length + offset) / 2;
    return [x, y];
  });

  /**
   * @function
   * @param {number} col
   * @returns {number} x
   */
  const getMidX = ss.linearRegressionLine(ss.linearRegression(xPoints));

  /**
   * @function
   * @param {number} row
   * @returns {number} y
   */
  const getMidY = ss.linearRegressionLine(ss.linearRegression(yPoints));

  /**
   * 取得所有素材位置
   */

  const colNum = Math.floor((width + itemWidth * (1 + ITEM_X_SPACE_RATIO)) / xOccu);
  const rowNum = yRanges.length;

  const xPoss = _.range(colNum)
    .map(col => {
      const midX = getMidX(col);
      const x = Math.round(midX - itemWidth / 2);
      const left = (midX - (itemWidth * ITEM_VIEW_SCALE) / 2) / width;
      const right = 1 - (midX + (itemWidth * ITEM_VIEW_SCALE) / 2) / width;
      return {
        pos: { x },
        view: { left, right },
      };
    })
    .filter(({ pos: { x } }) => x >= 0 && x + itemWidth <= width);
  const yPoss = _.range(rowNum).map(row => {
    const midY = getMidY(row);
    const y = Math.round(midY - itemWidth / 2);
    const top = (midY - (itemWidth * ITEM_VIEW_SCALE) / 2) / height;
    const bottom = 1 - (midY + (itemWidth * ITEM_VIEW_SCALE) / 2) / height;
    return {
      pos: { y },
      view: { top, bottom },
    };
  });

  const posisions = _.flatMap(xPoss, xPos =>
    yPoss.map(yPos => _.merge({ debug: { scale: ITEM_DEBUG_VIEW_W / itemWidth } }, xPos, yPos)),
  );

  /**
   * 测试用
   */

  const testImgs = [];

  // test square
  if (self.IS_TEST) {
    const testSquareImg = edgeImg.clone();
    posisions.forEach(({ pos: { x, y } }) => {
      for (let ix = x; ix < x + itemWidth; ix++) {
        for (let iy = y; iy < y + itemWidth; iy++) {
          const idx = testSquareImg.getPixelIndex(ix, iy);
          testSquareImg.bitmap.data[idx] = 200;
        }
      }
    });
    testImgs.push(testSquareImg);
  }

  // test row
  if (self.IS_TEST) {
    const testRowImg = edgeImg.clone();
    yRanges.forEach(({ start, length }) => {
      for (let ix = 0; ix < width; ix++) {
        for (let iy = start; iy < start + length; iy++) {
          const idx = testRowImg.getPixelIndex(ix, iy);
          testRowImg.bitmap.data[idx] = 200;
        }
      }
    });
    testImgs.push(testRowImg);
  }

  return { testImgs, posisions, itemWidth };
};
