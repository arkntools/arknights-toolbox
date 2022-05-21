const getUrl = title => `http://m.prts.wiki/index.php?title=${encodeURIComponent(title)}`;

module.exports = {
  HOME: getUrl('首页'),
  CHAR_LIST: getUrl('干员一览'),
  ITEM_LIST: getUrl('道具一览'),
};
