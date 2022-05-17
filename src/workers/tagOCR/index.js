/* global Tesseract:false */
import ImgWorker from 'comlink-loader?publicPath=./&name=assets/js/to.[hash].worker.[ext]!./imgWorker';
import _ from 'lodash';
import { transfer } from 'comlink';
import { dialog } from 'mdui';
import { keys as idbKeys } from 'idb-keyval';
import { enumTagMap } from '@/store/tag';
import snackbar from '@/utils/snackbar';
import i18n from '@/i18n';
import { humanReadableSize } from '@/utils/formatter';

const TSR_LIB_URL = 'https://code.bdstatic.com/npm/tesseract.js@2.1.5/dist/tesseract.min.js';
const TSR_CORE_URL = `https://code.bdstatic.com/npm/tesseract.js-core@2.2.0/tesseract-core.${
  window.WebAssembly ? 'wasm' : 'asm'
}.js`;
const TSR_WORKER_URL = 'https://code.bdstatic.com/npm/tesseract.js@2.1.5/dist/worker.min.js';
const TSR_LANG_DATA_PATH = 'https://tessdata.projectnaptha.com/4.0.0';
const TSR_LANG_DATA_CACHE_PATH = 'tesseract';

const langDataNameMap = {
  cn: 'chi_sim',
  tw: 'chi_tra',
  us: 'eng',
  jp: 'jpn',
  kr: 'kor',
};

/** @type {Tesseract.Worker} */
let tsrWorker = null;
let tsrCurLang = '';

/** @type {{ getCombinedTagImg: (...args: any[]) => Promise<Buffer> }} */
let imgWorker = null;

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

/**
 * @param {string} lang
 * @param {File} img
 * @returns {Promise<string[] | void>}
 */
export const localTagOCR = async (lang, img) => {
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

const initWorker = async () => {
  if (!window.Tesseract) {
    // eslint-disable-next-line no-console
    console.log('Loading Tesseract library');
    initializingSnackbar.open();
    await import(/* webpackIgnore: true */ TSR_LIB_URL);
  }
  if (!tsrWorker) {
    // eslint-disable-next-line no-console
    console.log('Loading Tesseract worker');
    initializingSnackbar.open();
    const worker = Tesseract.createWorker({
      cachePath: TSR_LANG_DATA_CACHE_PATH,
      corePath: TSR_CORE_URL,
      workerPath: TSR_WORKER_URL,
    });
    await worker.load();
    tsrWorker = worker;
  }
  if (!imgWorker) {
    // eslint-disable-next-line no-console
    console.log('Loading image processing worker');
    imgWorker = new ImgWorker();
  }
};

const initOCRLanguage = async lang => {
  if (tsrCurLang === lang) return true;
  initializingSnackbar.open();
  const dataName = langDataNameMap[lang];
  if (!(await langDataCacheExist(dataName))) {
    const size = await getLangDataSize(dataName);
    const confirmed = await confirmLoading(size);
    if (!confirmed) return false;
  }
  // eslint-disable-next-line no-console
  console.log('Initializing Tesseract language');
  await tsrWorker.loadLanguage(dataName);
  await tsrWorker.initialize(dataName);
  await tsrWorker.setParameters({
    tessjs_create_hocr: '0',
    tessjs_create_tsv: '0',
    preserve_interword_spaces: lang === 'us' ? '0' : '1',
    tessedit_char_whitelist: _.uniq(Object.keys(enumTagMap[lang]).join('')).join(''),
  });
  tsrCurLang = lang;
  return true;
};

const langDataCacheExist = async name => {
  try {
    const keys = await idbKeys();
    return keys.includes(`tesseract/${name}.traineddata`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('CheckLangDataCacheExist', e);
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
    // eslint-disable-next-line no-console
    console.error('GetLangDataSize', e);
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
