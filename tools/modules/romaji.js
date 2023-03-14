const _ = require('lodash');
const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const kuroshiro = new Kuroshiro();
const init = kuroshiro.init(new KuromojiAnalyzer());

const extraTable = {
  遊: 'yu',
  濯塵: 'takujin',
  承曦: 'syouki',
};

/**
 * @param {string} text
 * @returns {string}
 */
module.exports = async text => {
  if (/^[\w-]*$/.test(text)) return '';
  await init;
  const preprocessed = _.reduce(
    extraTable,
    (result, romaji, kanji) => result.replace(kanji, romaji),
    text,
  );
  return await kuroshiro.convert(preprocessed, { to: 'romaji', romajiSystem: 'passport' });
};
