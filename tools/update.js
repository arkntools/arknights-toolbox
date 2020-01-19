/*eslint-disable */
const get = require('./modules/autoRetryGet');
const download = require('./modules/autoRetryDownload');
const Cheerio = require('cheerio');
const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');
const md5 = require('md5');

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

// 技能ID与描述MD5对应表
const buildingBuffId2DescriptionMd5 = {};

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
    _.pickBy(characterTable, (v, k) => k.startsWith('char_')),
    (obj, { name, appellation, position, tagList, rarity, profession }, id) => {
      const shortId = id.replace(/^char_/, '');
      nameId2Name[shortId] = name;
      if (langShort !== 'zh') return;
      // TODO: pinyin & img
      obj[shortId] = {
        appellation,
        star: rarity + 1,
        recruitment: recruitmentList.includes(name),
        position: enumPosAndPro[position],
        profession: enumPosAndPro[profession],
        tags: tagList.map(tagName => tagName2Id[tagName]),
      };
    },
    {}
  );

  const isMaterial = id => /^[0-9]+$/.test(id) && 30000 < id && id < 32000;
  const getMaterialListObject = list =>
    _.transform(
      list.filter(({ id }) => isMaterial(id)),
      (obj, { id, count }) => {
        obj[id] = count;
      },
      {}
    );

  // 材料
  const itemId2Name = {};
  const material = _.transform(
    _.pickBy(itemTable.items, ({ itemId }) => isMaterial(itemId)),
    (obj, { itemId, name, rarity, sortId, stageDropList, buildingProductList }) => {
      itemId2Name[itemId] = name;
      if (langShort !== 'zh') return;
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
            : getMaterialListObject(buildingData.workshopFormulas[formula.formulaId].costs),
      };
    },
    {}
  );

  // 精英化 & 技能
  const skillId2Name = _.mapValues(
    _.omitBy(skillTable, (v, k) => k.startsWith('sktok_')),
    ({ levels }) => levels[0].name
  );
  const cultivate = _.transform(
    _.pickBy(characterTable, (v, k) => langShort === 'zh' && k.startsWith('char_')),
    (obj, { phases, allSkillLvlup, skills }, id) => {
      const shortId = id.replace(/^char_/, '');
      // 精英化
      const evolve = _.transform(
        phases,
        (arr, { evolveCost }) => {
          if (evolveCost) arr.push(getMaterialListObject(evolveCost));
        },
        []
      );
      // 通用技能
      const normal = allSkillLvlup.map(({ lvlUpCost }) => getMaterialListObject(lvlUpCost));
      // 精英技能
      const elite = skills
        .map(({ skillId, levelUpCostCond }) => ({
          id: skillId,
          cost: levelUpCostCond.map(({ levelUpCost }) => getMaterialListObject(levelUpCost)),
        }))
        .filter(({ cost }) => cost.length);
      const final = {
        evolve: evolve.every(obj => _.size(obj)) ? evolve : [],
        skills: {
          normal,
          elite,
        },
      };
      if (final.evolve.length + normal.length + elite.length) obj[shortId] = final;
    },
    {}
  );

  // 基建
  const buffId2Name = {};
  const buffMd52Description = {};
  const roomEnum2Name = _.mapValues(buildingData.rooms, ({ name }) => name);
  const buildingBuffs = _.transform(
    buildingData.buffs,
    (obj, { buffId, buffName, roomType, description }) => {
      buffId2Name[buffId] = buffName;
      description = description.replace(/<(.+?)>(.+?)<\/>/g, (str, key, value) => {
        switch (key) {
          case '@cc.vdown':
            return `[[${value}]]`;
          default:
            return `{{${value}}}`;
        }
      });
      let descriptionMd5;
      if (langShort === 'zh') {
        descriptionMd5 = md5(description);
        buildingBuffId2DescriptionMd5[buffId] = descriptionMd5;
      } else descriptionMd5 = buildingBuffId2DescriptionMd5[buffId];
      buffMd52Description[descriptionMd5] = description;
      if (langShort !== 'zh') return;
      obj[buffId] = {
        building: roomType,
        description: descriptionMd5,
      };
    },
    {}
  );
  const buildingChars = _.transform(
    _.pickBy(buildingData.chars, (v, k) => langShort === 'zh' && k.startsWith('char_')),
    (obj, { charId, buffChar }) => {
      const shortId = charId.replace(/^char_/, '');
      obj[shortId] = _.flatMap(buffChar, ({ buffData }) =>
        buffData.map(({ buffId, cond: { phase, level } }) => ({ id: buffId, unlock: `${phase}_${level}` }))
      );
    },
    {}
  );

  // 写入数据
  const writeData = (name, obj) => Fse.writeJSONSync(Path.join(outputDataDir, name), obj, { spaces: 2 });
  const writeLocales = (name, obj) => Fse.writeJSONSync(Path.join(outputLocalesDir, name), obj, { spaces: 2 });
  if (langShort === 'zh') {
    writeData('character.json', character);
    writeData('item.json', material);
    writeData('cultivate.json', cultivate);
  }
  writeLocales('tag.json', _.invert(tagName2Id));
  writeLocales('character.json', nameId2Name);
  writeLocales('material.json', itemId2Name);
  writeLocales('skill.json', skillId2Name);
  writeLocales('building.json', { name: roomEnum2Name, buff: { name: buffId2Name, description: buffMd52Description } });
});
