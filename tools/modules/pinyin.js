const _ = require('lodash');
const { pinyin, customPinyin } = require('pinyin-pro');

customPinyin({
  薄: 'bo',
  栎: 'li',
  重: 'chong',
  仇白: 'qiu bai',
});

const joinPinyin = arr => arr.join('');

module.exports = words => {
  if (/^[\w\s-]*$/.test(words)) return { full: '', head: '' };
  const py = pinyin(words, {
    toneType: 'none',
    type: 'array',
    v: true,
  });
  return {
    full: joinPinyin(py),
    head: joinPinyin(_.map(py, 0)),
  };
};
