import * as ocr from '@arkntools/paddlejs-ocr';
import config from '@arkntools/paddlejs-ocr/dist/defaultInitConfig';

(() => {
  const errChars = [
    ['狙', '祖', '狼'],
    ['术', '米'],
  ];
  errChars.forEach(([right, ...errors]) => {
    errors.forEach(error => {
      config.ocrChars = config.ocrChars.replace(error, right);
    });
  });
})();

let initPromise;
let status = 0;

export const getStatus = () => status;

export const init = () => {
  if (initPromise) return initPromise;
  status = 1;
  // eslint-disable-next-line no-console
  console.log('[tag-ocr] loading Paddle models');
  initPromise = ocr.init(config).then(() => {
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
