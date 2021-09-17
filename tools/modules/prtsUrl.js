const getUrl = title =>
  `http://prts.wiki/index.php?title=${encodeURIComponent(title)}&mobileaction=toggle_view_mobile`;

module.exports = {
  HOME: getUrl('首页'),
  CHAR_LIST: getUrl('干员一览'),
  ITEM_LIST: getUrl('道具一览'),
};
