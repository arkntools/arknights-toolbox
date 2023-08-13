/* global Tesseract:false */
/* eslint-disable no-console */
import ImgWorker from 'comlink-loader?publicPath=./&name=assets/js/to.[hash].worker.[ext]!./imgWorker';
import _ from 'lodash';
import { transfer } from 'comlink';
import { keys as idbKeys } from 'idb-keyval';
import { humanReadableSize } from '@/utils/formatter';
import { dataReadyAsync, hotUpdateEmitter } from '@/store/hotUpdate';
import { useDataStore } from '@/store/data';
import { Snackbar, loadConfirmLoading } from '../utils/tips';

const TSR_LIB_URL = 'https://fastly.jsdelivr.net/npm/tesseract.js@3.0.3/dist/tesseract.min.js';
const TSR_CORE_URL = `https://fastly.jsdelivr.net/npm/tesseract.js-core@3.0.2/tesseract-core.${
  window.WebAssembly ? 'wasm' : 'asm'
}.js`;
const TSR_WORKER_URL = 'https://fastly.jsdelivr.net/npm/tesseract.js@3.0.3/dist/worker.min.js';
const TSR_LANG_DATA_PATH = 'https://tessdata.projectnaptha.com/4.0.0';
const TSR_LANG_DATA_CACHE_PATH = 'tesseract';

const langDataNameMap = {
  cn: 'chi_sim',
  tw: 'chi_tra',
  us: 'eng',
  jp: 'jpn',
  kr: 'kor',
};

/** @type {import('tesseract.js').Worker} */
let tsrWorker = null;
let tsrCurLang = '';

/** @type {{ getCombinedTagImg: (...args: any[]) => Promise<Buffer> }} */
let imgWorker = null;

let preInitPromise = null;

const initializingSnackbar = new Snackbar('hr.ocr.localInitializing');
const processingSnackbar = new Snackbar('hr.ocr.processing');

hotUpdateEmitter.on('update', async () => {
  if (!(tsrWorker && tsrCurLang)) return;
  await setOCRParams(tsrCurLang);
});

/**
 * @param {string} lang
 * @param {Blob} img
 * @returns {Promise<string[] | void>}
 */
export const localTagOCR = async (lang, img) => {
  if (preInitPromise) await preInitPromise;
  await initWorker();
  const successed = await initOCRLanguage(lang);
  initializingSnackbar.close();
  if (!successed) return;
  processingSnackbar.open();
  try {
    const imgBuffer = await img.arrayBuffer();
    const resultBuffer = await imgWorker.getCombinedTagImg(transfer(imgBuffer, [imgBuffer]));
    const {
      data: { text },
    } = await tsrWorker.recognize(resultBuffer);
    return _.filter(text.trim().split(/\s*\n\s*/));
  } finally {
    processingSnackbar.close();
  }
};

/**
 * @param {string} lang
 */
export const preInitLanguage = lang => {
  if (preInitPromise) return;
  preInitPromise = (async () => {
    try {
      const dataName = langDataNameMap[lang];
      if (!(await langDataCacheExist(dataName))) return;
      await initWorker(true);
      await initOCRLanguage(lang, true);
    } catch (error) {
      console.error('[tag-ocr]', error);
    } finally {
      preInitPromise = null;
    }
  })();
};

const initWorker = async (preInit = false) => {
  if (!window.Tesseract) {
    console.log('[tag-ocr] loading Tesseract library');
    if (!preInit) initializingSnackbar.open();
    await import(/* webpackIgnore: true */ TSR_LIB_URL);
  }
  if (!tsrWorker) {
    console.log('[tag-ocr] loading Tesseract worker');
    if (!preInit) initializingSnackbar.open();
    const worker = Tesseract.createWorker({
      cachePath: TSR_LANG_DATA_CACHE_PATH,
      corePath: TSR_CORE_URL,
      workerPath: TSR_WORKER_URL,
    });
    await worker.load();
    tsrWorker = worker;
  }
  if (!imgWorker) {
    console.log('[tag-ocr] loading image processing worker');
    imgWorker = new ImgWorker();
  }
};

const initOCRLanguage = async (lang, preInit) => {
  if (tsrCurLang === lang) return true;

  if (!preInit) initializingSnackbar.open();
  const dataName = langDataNameMap[lang];
  if (!(await langDataCacheExist(dataName))) {
    const size = await getLangDataSize(dataName);
    const confirmed = await loadConfirmLoading(size);
    if (!confirmed) return false;
  }
  console.log('[tag-ocr] initializing Tesseract language');
  await tsrWorker.loadLanguage(dataName);
  await tsrWorker.initialize(dataName);
  await setOCRParams(lang);
  console.log('[tag-ocr] done');
  tsrCurLang = lang;
  return true;
};

const setOCRParams = async lang => {
  await dataReadyAsync;
  const store = useDataStore();
  await tsrWorker.setParameters({
    tessjs_create_hocr: '0',
    tessjs_create_tsv: '0',
    preserve_interword_spaces: lang === 'us' ? '0' : '1',
    tessedit_char_whitelist: _.uniq(Object.keys(store.enumTagMap[lang]).join('')).join(''),
  });
};

const langDataCacheExist = async name => {
  try {
    const keys = await idbKeys();
    return keys.includes(`tesseract/${name}.traineddata`);
  } catch (e) {
    console.error('[tag-ocr] CheckLangDataCacheExist', e);
    return false;
  }
};

const getLangDataSize = async name => {
  try {
    const url = `${TSR_LANG_DATA_PATH}/${name}.traineddata.gz`;
    const res = await fetch(url, { method: 'HEAD', mode: 'cors' });
    const size = res.headers.get('Content-Length');
    return size ? humanReadableSize(size) : 'N/A';
  } catch (e) {
    console.error('[tag-ocr] GetLangDataSize', e);
    return 'N/A';
  }
};
