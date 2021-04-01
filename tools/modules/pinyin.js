const _ = require('lodash');
const { pinyin } = require('pinyin-pro');

const FIXED_LIST = {
  阿: 'a',
  艾: 'ai',
  薄: 'bo',
  吽: 'hong',
};

const joinPinyin = arr => arr.join('').replace(/ü/g, 'v');

module.exports = words => {
  if (/^[\w\s-]*$/.test(words)) return { full: '', head: '' };
  const py = pinyin(
    words
      .split('')
      .map(word => FIXED_LIST[word] || word)
      .join(''),
    {
      toneType: 'none',
      type: 'array',
    },
  );
  return {
    full: joinPinyin(py),
    head: joinPinyin(_.map(py, 0)),
  };
};
