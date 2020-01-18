/*eslint-disable */
const get = require('./modules/autoRetryGet');
const download = require('./modules/autoRetryDownload');
const Cheerio = require('cheerio');
const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const sortObjectBy = (obj, fn) => _.fromPairs(_.sortBy(_.toPairs(obj), ([k, v]) => fn(k, v)));

const getPinyin = (word, style = pinyin.STYLE_NORMAL) => {
  const py = pinyin(word, {
    style,
    segment: true,
  });
  return _.flatten(py)
    .join('')
    .toLowerCase()
    .replace(/-/g, '');
};

const langList = {
  zh: 'zh_CN',
  en: 'en_US',
  ja: 'ja_JP',
  ko: 'ko_KR',
};
const data = lang =>
  _.transform(
    [
      'character_table.json',
      'building_data.json',
      'skill_table.json',
      'gacha_table.json',
      'item_table.json',
      'stage_table.json',
    ],
    (obj, file) => {
      obj[_.camelCase(file.split('.')[0])] = Fse.readJSONSync(`../../ArknightsGameData/${lang}/gamedata/excel/${file}`);
    },
    {}
  );

const enumPosAndPro = {
  WARRIOR: 1,
  SNIPER: 2,
  TANK: 3,
  MEDIC: 4,
  SUPPORT: 5,
  CASTER: 6,
  SPECIAL: 7,
  PIONEER: 8,
  MELEE: 9,
  RANGED: 10,
};
Object.freeze(enumPosAndPro);

const enumOccPer = {
  ALWAYS: 0,
  ALMOST: 1,
  USUAL: 2,
  OFTEN: 3,
  SOMETIMES: 4,
};
Object.freeze(enumOccPer);

const outputDataDir = `../src/data`;
Fse.ensureDirSync(outputDataDir);

// 公招干员列表
const getRecruitmentList = recruitDetail =>
  _.flatten(
    recruitDetail
      .replace(/<.+?>(.+?)<\/>/g, '$1')
      .replace(/\\n/g, ' ')
      .split('\n')
      .filter(line => line.startsWith('★'))
      .map(line =>
        line
          .replace(/★/g, '')
          .split('/')
          .map(name => name.trim())
      )
  );

_.each(langList, (langCode, langShort) => {
  const outputLocalesDir = `../src/locales/${langShort}`;
  Fse.ensureDirSync(outputLocalesDir);

  const { characterTable, buildingData, skillTable, gachaTable, itemTable, stageTable } = data(langCode);

  // 标签
  const tagName2Id = _.transform(
    gachaTable.gachaTags,
    (obj, { tagId, tagName }) => {
      obj[tagName] = tagId;
    },
    {}
  );
  Object.freeze(tagName2Id);

  // 角色
  const nameId2Name = {};
  const recruitmentList = langShort === 'zh' ? getRecruitmentList(gachaTable.recruitDetail) : [];
  const character = _.transform(
    characterTable,
    (obj, { name, appellation, position, tagList, rarity, profession }, id) => {
      if (!id.startsWith('char_')) return;
      const shortId = id.replace(/^char_/, '');
      nameId2Name[shortId] = name;
      if (langShort === 'zh') {
        // TODO: pinyin & img
        obj[shortId] = {
          appellation,
          star: rarity + 1,
          recruitment: recruitmentList.includes(name),
          position: enumPosAndPro[position],
          profession: enumPosAndPro[profession],
          tags: tagList.map(tagName => tagName2Id[tagName]),
        };
      }
    },
    {}
  );

  // 材料
  const isMaterial = id => /^[0-9]+$/.test(id) && 30000 < id && id < 32000;
  const itemId2Name = {};
  const material = _.transform(
    itemTable.items,
    (obj, { itemId, name, rarity, sortId, stageDropList, buildingProductList }) => {
      if (!isMaterial(itemId)) return;
      itemId2Name[itemId] = name;
      if (langShort === 'zh') {
        const formula = _.find(buildingProductList, ({ roomType }) => roomType === 'WORKSHOP');
        obj[itemId] = {
          sortId,
          rare: rarity + 1,
          drop: sortObjectBy(
            _.transform(
              stageDropList,
              (drop, { stageId, occPer }) => {
                const { stageType, code } = stageTable.stages[stageId];
                if (stageType !== 'MAIN') return;
                drop[code] = enumOccPer[occPer];
              },
              {}
            ),
            k =>
              k
                .replace(/^[^0-9]+/, '')
                .split('-')
                .map(c => _.pad(c, 3, '0'))
                .join('')
          ),
          madeof:
            typeof formula === 'undefined'
              ? {}
              : _.transform(
                  buildingData.workshopFormulas[formula.formulaId].costs.filter(({ id }) => id > 30000),
                  (madeof, { id, count }) => {
                    madeof[id] = count;
                  },
                  {}
                ),
        };
      }
    },
    {}
  );

  // 写入数据
  const writeData = (name, obj) => Fse.writeJSONSync(Path.join(outputDataDir, name), obj, { spaces: 2 });
  const writeLocales = (name, obj) => Fse.writeJSONSync(Path.join(outputLocalesDir, name), obj, { spaces: 2 });
  if (langShort === 'zh') {
    writeData('character.json', character);
    writeData('item.json', material);
  }
  writeLocales('tag.json', _.invert(tagName2Id));
  writeLocales('character.json', nameId2Name);
  writeLocales('material.json', itemId2Name);
});
