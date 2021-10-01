import DepotRecognitionWorker from 'comlink-loader?publicPath=./&name=assets/js/dr.[hash].worker.[ext]!@arkntools/depot-recognition/es/worker';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import { transfer } from 'comlink';
import { Base64 } from 'js-base64';
import md5 from 'js-md5';

import order from '@/data/itemOrder.json';
import pkgUrl from 'file-loader?name=assets/pkg/item.[md5:hash:hex:8].[ext]!@/assets/pkg/item.pkg';
const pkgMd5 = /([a-z\d]{8})\.pkg$/.exec(pkgUrl)?.[1];

const nls = new NamespacedLocalStorage('dr.pkg');

let worker = null;
let recognizer = null;

export const getRecognizer = async (force = false) => {
  if (recognizer && !force) return recognizer;
  let pkg = (() => {
    try {
      // read local cache
      if (nls.getItem('md5') !== pkgMd5) return;
      const pkgB64 = nls.getItem('data');
      if (!pkgB64) return;
      return Base64.toUint8Array(pkgB64).buffer;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[dr-pkg-cache]', e);
    }
  })();
  if (!pkg) {
    pkg = await fetch(pkgUrl).then(r => r.arrayBuffer());
    if (pkgMd5 !== md5(pkg).substr(0, 8)) throw new Error('Item resource pkg md5 mismatch');
    nls.setItem('md5', pkgMd5);
    nls.setItem('data', Base64.fromUint8Array(new Uint8Array(pkg)));
  }
  if (!worker) worker = new DepotRecognitionWorker();
  recognizer = await new worker.DeportRecognizer(transfer({ order, pkg }, [pkg]));
  return recognizer;
};
