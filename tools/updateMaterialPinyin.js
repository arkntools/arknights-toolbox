const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const JSON_MATERIAL = Path.join(__dirname, '../src/data/material.json');

const data = Fse.readJSONSync(JSON_MATERIAL);
data.forEach(item => {
  const fullPY = pinyin(item.name, {
    style: pinyin.STYLE_NORMAL,
    segment: true,
  });
  item.pinyin = _.flatten(fullPY)
    .join('')
    .toLowerCase();
});

Fse.writeJSONSync(JSON_MATERIAL, data);
