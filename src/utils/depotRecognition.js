/* eslint-disable no-console */
import _ from 'lodash';
import Jimp from 'jimp/es';
import { linearRegression } from 'simple-statistics';
import { materialTable, materialOrder } from '../store/material';

import itemImgOffset from '../data/itemImgOffset.json';

const IMG_SL = 100;
const IMG_SL_HALF = Math.floor(IMG_SL / 2);
const IMG_PADDING = 6;
const IMG_MARGIN = 10;
const IMG_CTX_SL = 83;
const IMG_ROW_NUM = 3;
const SS_HEIGHT = 507;
const SS_TOP = 84;
const SS_BOTTOM = 56;

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

let loadedMaterials = null;

/**
 * 组合素材图像
 *
 * @param {Jimp} bg
 * @param {Jimp} img
 */
const compositeItem = (bg, img, [ox = 0, oy = 0] = []) =>
  bg.clone().composite(img, (bg.getWidth() - img.getWidth()) / 2 + ox, (bg.getHeight() - img.getHeight()) / 2 + oy);

/**
 * 加载所有素材图片
 */
const loadAllMaterials = async () => {
  if (loadedMaterials) return;
  const getURL = name => `./assets/img/material/${name}.png`;
  const [bgs, items, itemNumMask] = await Promise.all([
    Promise.all(_.range(1, 6).map(i => Jimp.read(getURL(`T${i}`)))),
    Promise.all(materialOrder.map(name => Jimp.read(getURL(name)))),
    Jimp.read('./assets/img/other/item-num-mask.png'),
  ]);
  loadedMaterials = {
    materialImgs: _.zip(
      materialOrder,
      materialOrder.map((name, i) =>
        compositeItem(bgs[materialTable[name].rare - 1], items[i], itemImgOffset[name])
          .resize(IMG_SL, IMG_SL, Jimp.RESIZE_BEZIER)
          .composite(itemNumMask, 0, 0)
          .circle({ radius: IMG_SL / 2 - IMG_PADDING })
      )
    ),
    itemNumMask,
  };
  Object.freeze(loadedMaterials);
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
  return {
    tops: [0, IMG_SL + space, img.getHeight() - IMG_SL],
    rows: [
      img.clone().crop(0, 0, img.getWidth(), IMG_SL),
      img.clone().crop(0, IMG_SL + space, img.getWidth(), IMG_SL),
      img.clone().crop(0, img.getHeight() - IMG_SL, img.getWidth(), IMG_SL),
    ],
  };
};

/**
 * 该列是否算素材
 *
 * @param {Jimp} img
 * @param {Number} x
 */
const isColHasWhite = (img, x) => {
  let sum = 0;
  for (let y = 0; y < img.getHeight(); y++) {
    const { r } = Jimp.intToRGBA(img.getPixelColor(x, y));
    sum += r;
  }
  return sum > 127;
};

/**
 * 去除噪点
 *
 * @param {Array} range
 */
const removeRangesNoise = (range, size = 1) => _.remove(range, ({ length }) => length <= size);

/**
 * 反向范围
 *
 * @param {Array} range
 * @param {Number} width
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
 * 获取素材列范围
 *
 * @param {Jimp} img
 * @returns
 */
const getColRanges = img => {
  const blackArr = [];
  for (let x = 0; x < img.getWidth(); x++) {
    blackArr.push(!isColHasWhite(img, x));
  }
  const blackRange = _.transform(
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

export const recognize = async fileURL => {
  const ready = loadAllMaterials();
  const origImg = await Jimp.read(fileURL);

  // 得到相对准确的列信息
  const { tpl, gimg } = init(origImg);
  const gimgW = gimg.getWidth();
  const { rows, tops } = splitRow(gimg);
  const colsRanges = rows.map(row => getColRanges(row));
  const colPosTable = getColPosTable(colsRanges, gimgW);

  // 定位每个素材
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

  await ready;
  const { materialImgs, itemNumMask } = loadedMaterials;
  const test = [];

  // 切割素材
  const itemImgs = posisions.map(({ pos: { x, y } }) =>
    tpl
      .clone()
      .crop(x, y, IMG_SL, IMG_SL)
      .composite(itemNumMask, 0, 0)
      .circle({ radius: IMG_SL / 2 - IMG_PADDING })
  );
  const simResults = itemImgs.map(itemImg => {
    const diffs = materialImgs.map(([name, materialImg]) => [name, Jimp.diff(itemImg, materialImg, 0.18).percent]);
    const [name, diff] = _.minBy(diffs, '1');
    return { sim: { name, diff, diffs: _.sortBy(diffs, a => a[1]) } };
  });
  console.log(simResults);

  return {
    data: _.merge(posisions, simResults),
    test,
  };
};
