const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const JSON_MATERIAL = Path.join(__dirname, '../src/data/material.json');
const JSON_MATERIAL_ORDER = Path.join(__dirname, '../src/data/materialOrder.json');

const data = Fse.readJSONSync(JSON_MATERIAL);
const order = _.transform(Fse.readJSONSync(JSON_MATERIAL_ORDER), (o, v, k) => (o[v] = k), {});

data.sort((a, b) => order[a.name] - order[b.name]);

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
