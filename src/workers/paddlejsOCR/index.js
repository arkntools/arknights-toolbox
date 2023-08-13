import PaddleWorker from 'comlink-loader?publicPath=./&name=assets/js/pd.[hash].worker.[ext]!./paddle';
import { transfer } from 'comlink';
import _ from 'lodash';
import { Snackbar, loadConfirmLoading } from '../utils/tips';
import { IS_DEV } from '@/utils/env';

const initializingSnackbar = new Snackbar('hr.ocr.localInitializing');
const processingSnackbar = new Snackbar('hr.ocr.processing');

/** @type {ComlinkObject<import('./paddle')>} */
let worker = null;

const initWorker = () => {
  if (worker) return;
  worker = new PaddleWorker();
};

const hasDataCache = async () => {
  const cacheKeys = (await window.caches.keys()).filter(key => key.includes('runtime'));
  const cacheList = _.flatten(
    await Promise.all(
      cacheKeys.map(async key => {
        const cache = await window.caches.open(key);
        return cache.keys();
      }),
    ),
  );
  const cachedUrlSet = _.transform(
    cacheList,
    (set, req) => {
      if (req.url.startsWith('https://paddlejs.bj.bcebos.com/')) {
        set.add(req.url);
      }
    },
    new Set(),
  );
  const urls = [
    'https://paddlejs.bj.bcebos.com/models/fuse/ocr/ch_PP-OCRv2_det_fuse_activation/model.json',
    'https://paddlejs.bj.bcebos.com/models/fuse/ocr/ch_PP-OCRv2_det_fuse_activation/chunk_1.dat',
    'https://paddlejs.bj.bcebos.com/models/fuse/ocr/ch_PP-OCRv2_rec_fuse_activation/model.json',
    'https://paddlejs.bj.bcebos.com/models/fuse/ocr/ch_PP-OCRv2_rec_fuse_activation/chunk_1.dat',
    'https://paddlejs.bj.bcebos.com/models/fuse/ocr/ch_PP-OCRv2_rec_fuse_activation/chunk_2.dat',
  ];
  return urls.every(url => cachedUrlSet.has(url));
};

export const paddlePreInit = async () => {
  if (!(await hasDataCache())) return;
  initWorker();
  worker.init();
};

/**
 * @param {Blob} file
 */
export const paddleOCR = async file => {
  initWorker();
  const status = await worker.getStatus();
  if (status !== 2) {
    if (
      !IS_DEV &&
      status === 0 &&
      !(await hasDataCache()) &&
      !(await loadConfirmLoading('~12 MB'))
    ) {
      return;
    }
    initializingSnackbar.open();
    try {
      await worker.init();
    } finally {
      initializingSnackbar.close();
    }
  }
  processingSnackbar.open();
  try {
    const ab = await file.arrayBuffer();
    return await worker.recognize(transfer(ab, [ab]));
  } finally {
    processingSnackbar.close();
  }
};
