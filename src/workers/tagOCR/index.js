/* global Tesseract:false */
/* eslint-disable no-console */
import ImgWorker from 'comlink-loader?publicPath=./&name=assets/js/to.[hash].worker.[ext]!./imgWorker';
import _ from 'lodash';
import { transfer } from 'comlink';
import { dialog } from 'mdui';
import { keys as idbKeys } from 'idb-keyval';
import snackbar from '@/utils/snackbar';
import i18n from '@/i18n';
import { humanReadableSize } from '@/utils/formatter';
import { dataReadyAsync, hotUpdateEmitter } from '@/store/hotUpdate';
import { useDataStore } from '@/store/data';

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

let preinitPromise = null;

const initializingSnackbar = new (class InitializingSnackbar {
  open() {
    if (this.inst) return;
    this.inst = snackbar({
      message: i18n.t('hr.ocr.localInitializing'),
      closeOnOutsideClick: false,
      timeout: 0,
    });
  }
  close() {
    if (!this.inst) return;
    this.inst.close();
    this.inst = null;
  }
})();

hotUpdateEmitter.on('update', async () => {
  if (!(tsrWorker && tsrCurLang)) return;
  await setOCRParams(tsrCurLang);
});

/**
 * @param {string} lang
 * @param {File} img
 * @returns {Promise<string[] | void>}
 */
export const localTagOCR = async (lang, img) => {
  if (preinitPromise) await preinitPromise;
  await initWorker();
  const successed = await initOCRLanguage(lang);
  initializingSnackbar.close();
  if (!successed) return;
  const processingSnackbar = snackbar({
    message: i18n.t('hr.ocr.processing'),
    closeOnOutsideClick: false,
    timeout: 0,
  });
  const imgBuffer = await img.arrayBuffer();
  const resultBuffer = await imgWorker.getCombinedTagImg(transfer(imgBuffer, [imgBuffer]));
  const {
    data: { text },
  } = await tsrWorker.recognize(resultBuffer);
  processingSnackbar.close();
  return _.filter(text.trim().split(/\s*\n\s*/));
};

/**
 * @param {string} lang
 */
export const preinitLanguage = async lang => {
  if (preinitPromise) return;
  preinitPromise = (async () => {
    try {
      const dataName = langDataNameMap[lang];
      if (!(await langDataCacheExist(dataName))) return;
      await initWorker(true);
      await initOCRLanguage(lang, true);
    } catch (error) {
      console.error('[tag-ocr]', error);
    } finally {
      preinitPromise = null;
    }
  })();
};

const initWorker = async (preinit = false) => {
  if (!window.Tesseract) {
    console.log('[tag-ocr] loading Tesseract library');
    if (!preinit) initializingSnackbar.open();
    await import(/* webpackIgnore: true */ TSR_LIB_URL);
  }
  if (!tsrWorker) {
    console.log('[tag-ocr] loading Tesseract worker');
    if (!preinit) initializingSnackbar.open();
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

const initOCRLanguage = async (lang, preinit) => {
  if (tsrCurLang === lang) return true;

  if (!preinit) initializingSnackbar.open();
  const dataName = langDataNameMap[lang];
  if (!(await langDataCacheExist(dataName))) {
    const size = await getLangDataSize(dataName);
    const confirmed = await confirmLoading(size);
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

/** @returns {Promise<boolean>} */
const confirmLoading = async size =>
  new Promise(resolve => {
    dialog({
      title: i18n.t('common.notice'),
      content: i18n.t('hr.ocr.loadingConfirm', { size }),
      history: false,
      buttons: [
        {
          text: i18n.t('common.no'),
          onClick: () => resolve(false),
        },
        {
          text: i18n.t('common.yes'),
          onClick: () => resolve(true),
        },
      ],
    });
  });
