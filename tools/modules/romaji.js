const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const kuroshiro = new Kuroshiro();
const init = kuroshiro.init(new KuromojiAnalyzer());

const extraTable = {
  遊龍: 'yuryu',
  濯塵: 'takujin',
  承曦: 'shoasahi',
};

/**
 * @param {string} text
 * @returns {string}
 */
module.exports = async text => {
  if (/^[\w-]*$/.test(text)) return '';
  await init;
  for (const [kanji, romaji] of Object.entries(extraTable)) {
    if (text.startsWith(kanji)) {
      text = text.replace(kanji, romaji);
      break;
    }
  }
  return kuroshiro.convert(text, { to: 'romaji', romajiSystem: 'passport' });
};
