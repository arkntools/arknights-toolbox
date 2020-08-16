const Path = require('path');
const _ = require('lodash');
const Cheerio = require('cheerio');
const get = require('./modules/autoRetryGet');
const { downloadTinied } = require('./modules/autoRetryDownload');

const itemName2Id = {
  ..._.invert(require('../src/locales/cn/material.json')),
  ..._.invert(
    _.mapValues(require('../src/locales/cn/item.json'), (name, id) =>
      2000 < id && id < 3000 ? `${name}作战记录` : name
    )
  ),
};

const ITEM_URL = 'http://prts.wiki/w/%E9%81%93%E5%85%B7%E4%B8%80%E8%A7%88';
const DL_PATH = Path.resolve(__dirname, '../public/assets/img/item/');

get(ITEM_URL).then(async html => {
  const $ = Cheerio.load(html, { decodeEntities: false });
  const itemList = _.transform(
    Array.from($('.smwdata')),
    (arr, item) => {
      const $item = $(item);
      const name = $item.attr('data-name');
      if (name in itemName2Id) {
        arr.push([
          itemName2Id[name],
          $item
            .attr('data-file')
            .replace(/\/100px-.*/, '')
            .replace(/\/thumb\//, '/')
            .replace(/^\/\//, 'http://'),
        ]);
      }
    },
    []
  );
  for (const [id, url] of itemList) {
    await downloadTinied(url, Path.join(DL_PATH, `${id}.png`), `Download ${id}`);
  }
});
