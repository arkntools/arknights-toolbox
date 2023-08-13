import * as ocr from '@arkntools/paddlejs-ocr';

let initPromise;
let status = 0;

export const getStatus = () => status;

export const init = () => {
  if (initPromise) return initPromise;
  status = 1;
  // eslint-disable-next-line no-console
  console.log('[tag-ocr] loading Paddle models');
  initPromise = ocr.init().then(() => {
    status = 2;
    // eslint-disable-next-line no-console
    console.log('[tag-ocr] done');
  });
  return initPromise;
};

export const recognize = async file => {
  const { text } = await ocr.recognize(file);
  return text;
};
