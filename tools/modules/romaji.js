const _ = require('lodash');
const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const kuroshiro = new Kuroshiro();
const init = kuroshiro.init(new KuromojiAnalyzer());

const extraTable = {
  遊: 'yu',
  濯: 'taku',
};

/**
 * @param {string} text
 * @returns {string}
 */
module.exports = async text => {
  if (/^[\w-]*$/.test(text)) return '';
  await init;
  return _.reduce(
    extraTable,
    (result, romaji, kanji) => result.replace(kanji, romaji),
    await kuroshiro.convert(text, { to: 'romaji', romajiSystem: 'passport' }),
  );
};
