/* global _, Jimp */
/** @typedef {import('jimp')} Jimp */

import { isTrustSim } from './trustSim';

/**
 * 相似度计算
 *
 * @param {Jimp} input
 * @param {[string, Jimp][]} compares
 * @returns {{ name: string, diff: number, diffs: [string, number][] }}
 */
export const getSim = (input, compares) => {
  if (!compares.length) return null;
  const diffs = _.sortBy(
    compares.map(([id, img]) => [id, Jimp.diff(input, img, 0.2).percent]),
    1,
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
export const getSims = (inputs, compares) => {
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
    const leftLastSim = _.findLast(leftSims, sim => sim);
    const rightSims = getSims(
      inputs.slice(inputCenterI + 1),
      isTrustSim(leftLastSim)
        ? compares.slice(compares.findIndex(([name]) => name === leftLastSim.name) + 1)
        : compares,
    );
    return [...leftSims, inputCenterSim, ...rightSims];
  }
};
