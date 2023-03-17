import DepotRecognitionWorker from 'comlink-loader?publicPath=./&name=assets/js/dr.[hash].worker.[ext]!@arkntools/depot-recognition/worker';
import NamespacedLocalStorage from '@/utils/NamespacedLocalStorage';
import { get as idbGet, setMany as idbSetMany } from 'idb-keyval';
import { transfer, releaseProxy } from 'comlink';
import calcMd5 from 'js-md5';
import { dataReadyAsync, hotUpdateEmitter } from '@/store/hotUpdate';
import { useDataStore } from '@/store/data';

const nls = new NamespacedLocalStorage('dr.pkg');
nls.clear(); // 改用 idb

/** @type {DepotRecognitionWorker} */
let worker = null;
/** @type {import('@arkntools/depot-recognition/worker/comlinkLoader').RemoteDeportRecognizer} */
let recognizer = null;
let curServer = null;
let curPkgMd5 = null;

hotUpdateEmitter.on('update', async () => {
  if (!(recognizer && curServer)) return;
  const store = useDataStore();
  await recognizer.setOrder(store.materialOrder[curServer]);
});

export const getRecognizer = async (server, force = false, isPreloadFromCache = false) => {
  await dataReadyAsync;
  const store = useDataStore();
  if (recognizer && !force && curPkgMd5 === store.itemZipMd5) {
    if (server !== curServer) {
      await recognizer.setOrder(store.materialOrder[server]);
      curServer = server;
    }
    return recognizer;
  }
  let pkg = await (async () => {
    try {
      // read local cache
      if ((await idbGet('dr.pkg/md5')) !== store.itemZipMd5) return;
      // eslint-disable-next-line no-console
      console.log('[dr-pkg-cache] load pkg');
      return await idbGet('dr.pkg/data');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[dr-pkg-cache]', e);
    }
  })();
  if (!pkg) {
    if (isPreloadFromCache) return;
    pkg = await fetch(store.itemZipUrl).then(r => r.arrayBuffer());
    if (store.itemZipMd5 !== calcMd5(pkg).substring(0, 8)) {
      throw new Error('Item resource pkg md5 mismatch');
    }
    await idbSetMany([
      ['dr.pkg/md5', store.itemZipMd5],
      ['dr.pkg/data', pkg],
    ]);
  }
  if (!worker) worker = new DepotRecognitionWorker();
  recognizer?.[releaseProxy]?.();
  recognizer = await new worker.DeportRecognizer(
    transfer({ order: store.materialOrder[server], pkg, preload: true }, [pkg]),
  );
  curServer = server;
  curPkgMd5 = store.itemZipMd5;
  return recognizer;
};
