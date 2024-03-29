import * as ocr from '@arkntools/paddlejs-ocr';
import config from '@arkntools/paddlejs-ocr/dist/defaultInitConfig';

(() => {
  const errChars = [
    ['狙', 623, 984, 2079, 3762],
    ['术', 435, 485, 3678],
    ['辅', 128, 1952, 2859],
    ['攻', 1809],
    ['干', 89],
    ['员', 4525],
    ['援', 546, 3052],
    ['重', 340, 1300],
    ['攻', 4638],
    ['速', 6007],
    ['弱', 1509],
    ['深', 3089],
    ['高', 532],
    ['装', 41, 5185],
    ['复', 709],
    ['存', 3543],
    ['费', 4007],
    ['复', 2353],
    ['控', 4578],
    ['特', 451],
    ['程', 3232],
  ];
  const chars = config.ocrChars.split('');
  errChars.forEach(([char, ...indexes]) => {
    indexes.forEach(i => {
      chars[i] = char;
    });
  });
  config.ocrChars = chars;
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
