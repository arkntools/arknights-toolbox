const Kuroshiro = require('kuroshiro').default;
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');

const kuroshiro = new Kuroshiro();
const init = kuroshiro.init(new KuromojiAnalyzer());

/**
 * @param {string} text
 * @returns {string}
 */
module.exports = async text => {
  if (/^[\w-]*$/.test(text)) return '';
  await init;
  const result = await kuroshiro.convert(text, { to: 'romaji', romajiSystem: 'passport' });
  return result.replace('遊', 'yu');
};
