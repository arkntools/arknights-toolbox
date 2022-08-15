import DepotRecognitionWorker from 'comlink-loader?publicPath=./&name=assets/js/dr.[hash].worker.[ext]!@arkntools/depot-recognition/worker';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import { get as idbGet, setMany as idbSetMany } from 'idb-keyval';
import { transfer } from 'comlink';
import md5 from 'js-md5';

import order from '@/data/itemOrder.json';
import pkgUrl from 'file-loader?name=assets/pkg/item.[md5:hash:hex:8].[ext]!@/assets/pkg/item.pkg';
const pkgMd5 = /([a-z\d]{8})\.pkg$/.exec(pkgUrl)?.[1];

const nls = new NamespacedLocalStorage('dr.pkg');
nls.clear(); // 改用 idb

let worker = null;
let recognizer = null;

/** @typedef {import('@arkntools/depot-recognition/worker/comlinkLoader').DepotRecognitionWrap} DepotRecognitionWrap */

/**
 * @param {boolean} [force]
 * @returns {Promise<DepotRecognitionWrap>}
 */
export const getRecognizer = async (force = false) => {
  if (recognizer && !force) return recognizer;
  let pkg = await (async () => {
    try {
      // read local cache
      if ((await idbGet('dr.pkg/md5')) !== pkgMd5) return;
      return await idbGet('dr.pkg/data');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[dr-pkg-cache]', e);
    }
  })();
  if (!pkg) {
    pkg = await fetch(pkgUrl).then(r => r.arrayBuffer());
    if (pkgMd5 !== md5(pkg).substring(0, 8)) throw new Error('Item resource pkg md5 mismatch');
    await idbSetMany([
      ['dr.pkg/md5', pkgMd5],
      ['dr.pkg/data', pkg],
    ]);
  }
  if (!worker) worker = new DepotRecognitionWorker();
  recognizer = await new worker.DeportRecognizer(transfer({ order, pkg }, [pkg]));
  return recognizer;
};
