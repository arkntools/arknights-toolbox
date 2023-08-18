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
    'https://js-models.bj.bcebos.com/PaddleOCR/PP-OCRv3/ch_PP-OCRv3_det_infer_js_960/model.json',
    'https://js-models.bj.bcebos.com/PaddleOCR/PP-OCRv3/ch_PP-OCRv3_det_infer_js_960/chunk_1.dat',
    'https://js-models.bj.bcebos.com/PaddleOCR/PP-OCRv3/ch_PP-OCRv3_rec_infer_js/model.json',
    'https://js-models.bj.bcebos.com/PaddleOCR/PP-OCRv3/ch_PP-OCRv3_rec_infer_js/chunk_1.dat',
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
      !(await loadConfirmLoading('~8 MB'))
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
