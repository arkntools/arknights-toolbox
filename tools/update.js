/*eslint-disable */
const Cheerio = require('cheerio');
const get = require('./modules/autoRetryGet');
const { downloadTinied } = require('./modules/autoRetryDownload');
const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');
const md5 = require('md5');
const handleBuildingSkills = require('./modules/handleBuildingSkills');

const avatarDir = Path.resolve(__dirname, '../public/assets/img/avatar');
const prtsHome = 'http://ak.mooncell.wiki/index.php?title=%E9%A6%96%E9%A1%B5&mobileaction=toggle_view_mobile';
const prtsURL = 'http://ak.mooncell.wiki/load.php?debug=false&lang=zh-cn&modules=ext.gadget.charFilter&only=scripts';

const sortObjectBy = (obj, fn) => _.fromPairs(_.sortBy(_.toPairs(obj), ([k, v]) => fn(k, v)));
const idStandardization = id => id.replace(/\[([0-9]+?)\]/g, '_$1');
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
const getStageList = stages =>
  Object.values(stages)
    .filter(({ stageType }) => ['MAIN', 'SUB'].includes(stageType))
    .map(({ code }) => code);

const langEnum = {
  zh: 0,
  en: 1,
  ja: 2,
  ko: 3,
};
Object.freeze(langEnum);
const langList = {
  zh: 'zh_CN',
  en: 'en_US',
  ja: 'ja_JP',
  ko: 'ko_KR',
};
Object.freeze(langList);
const getDataURL = lang =>
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
      obj[_.camelCase(file.split('.')[0])] =
        process.env.UPDATE_SOURCE === 'local'
          ? Path.resolve(__dirname, `../../ArknightsGameData/${lang}/gamedata/excel/${file}`)
          : process.env.UPDATE_SOURCE === 'cdn'
          ? `https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData/${lang}/gamedata/excel/${file}`
          : `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/${lang}/gamedata/excel/${file}`;
    },
    {}
  );
const data = _.mapValues(langList, lang => getDataURL(lang));

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

const extItem = ['4001', 'AP_GAMEPLAY', '2001', '2002', '2003', '2004'];

const robotTagOwner = ['285_medic2', '286_cast3'];

const outputDataDir = Path.resolve(__dirname, '../src/data');
Fse.ensureDirSync(outputDataDir);

// 公招干员列表
const getRecruitmentList = recruitDetail =>
  _.flatten(
    recruitDetail
      .replace(/<.+?>(.+?)<\/>/g, '$1')
      .replace(/\\n/g, '\n')
      .split(/\n?[-★]+\n/)
      .splice(1)
      .filter(line => line)
      .map(line => line.split('/').map(name => name.trim()))
  );

// 技能ID与描述MD5对应表
let buildingBuffId2DescriptionMd5 = {};

(async () => {
  // 准备数据
  for (const langShort in langList) {
    const dataURL = data[langShort];
    for (const key in dataURL) {
      dataURL[key] = process.env.UPDATE_SOURCE === 'local' ? Fse.readJSONSync(dataURL[key]) : await get(dataURL[key]);
    }
  }

  // 写入数据
  const writeJSON = (file, obj) => {
    if (!Fse.existsSync(file)) Fse.writeJSONSync(file, {});
    if (!_.isEqual(Fse.readJSONSync(file), obj)) {
      Fse.writeJSONSync(file, obj, { spaces: 2 });
      require('./modules/updateTimestamp');
      return true;
    }
    return false;
  };
  const checkObjs = (...objs) => {
    objs.forEach(obj => {
      if (_.size(obj) === 0) throw new Error('Empty object.');
    });
  };
  const writeData = (name, obj) => {
    checkObjs(obj);
    if (writeJSON(Path.join(outputDataDir, name), obj)) console.log(`Update ${name}`);
  };

  // 获取头像列表
  const getThumbAvatar = icon => {
    if (icon.indexOf('/thumb/') !== -1) {
      const paths = icon.split('/');
      paths[paths.length - 1] = '80px-';
      return paths.join('/');
    }
    return `${icon.replace('/images/', '/images/thumb/')}/80px-`;
  };
  const avatarList = _.transform(
    JSON.parse(/(?<=var datalist=).*?\](?=;)/.exec((await get(prtsURL)).replace(/\n|<.*?>/g, ''))[0]),
    (obj, { cn, icon }) => {
      obj[cn] = getThumbAvatar(icon);
    },
    {}
  );
  await get(prtsHome).then(html => {
    const $ = Cheerio.load(html, { decodeEntities: false });
    const newOperators = Array.from($('h3:contains(近期新增) + p a'));
    newOperators.forEach(a => {
      const $a = $(a);
      const name = decodeURIComponent(_.last($a.attr('href').split('/')));
      if (avatarList[name]) return;
      const icon = $(a)
        .find('#charicon')
        .attr('data-src');
      avatarList[name] = getThumbAvatar(icon);
    });
  });

  // 解析数据
  let character;
  let cnStageList = [];
  const unopenedStage = {};
  for (const langShort of Object.keys(langList)) {
    const outputLocalesDir = Path.resolve(__dirname, `../src/locales/${langShort}`);
    Fse.ensureDirSync(outputLocalesDir);

    const { characterTable, buildingData, skillTable, gachaTable, itemTable, stageTable } = data[langShort];

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
    const recruitmentList = getRecruitmentList(gachaTable.recruitDetail);
    if (langShort === 'zh') {
      character = _.transform(
        _.pickBy(characterTable, (v, k) => k.startsWith('char_')),
        (obj, { name, appellation, position, tagList, rarity, profession }, id) => {
          const shortId = id.replace(/^char_/, '');
          const [full, head] = [getPinyin(name), getPinyin(name, pinyin.STYLE_FIRST_LETTER)];
          if (robotTagOwner.includes(shortId) && !tagList.includes('支援机械')) tagList.push('支援机械');
          obj[shortId] = {
            pinyin: { full, head },
            appellation,
            star: rarity + 1,
            recruitment: [],
            position: enumPosAndPro[position],
            profession: enumPosAndPro[profession],
            tags: tagList.map(tagName => tagName2Id[tagName]).filter(_.isNumber),
          };
        },
        {}
      );
      Object.freeze(character);
    }
    const nameId2Name = _.transform(
      _.pickBy(characterTable, (v, k) => k.startsWith('char_')),
      (obj, { name }, id) => {
        const shortId = id.replace(/^char_/, '');
        obj[shortId] = name;
        if (recruitmentList.includes(name)) character[shortId].recruitment.push(langEnum[langShort]);
      },
      {}
    );

    // 下载头像
    if (langShort === 'zh') {
      const name2Id = _.invert(nameId2Name);
      for (const name in name2Id) {
        if (name in avatarList) {
          const id = name2Id[name];
          // Use download() instead of downloadTinied() if quota of TinyPng exceeded
          await downloadTinied(
            avatarList[name],
            Path.join(avatarDir, `${id}.png`),
            `Download ${avatarList[name]} as ${id}.png`
          );
        }
      }
    }

    // 未实装关卡
    if (langShort === 'zh') {
      cnStageList = getStageList(stageTable.stages);
      unopenedStage[langShort] = [];
    } else {
      const stageList = getStageList(stageTable.stages);
      unopenedStage[langShort] = _.without(cnStageList, ...stageList);
    }

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
    const extItemId2Name = _.mapValues(_.pick(itemTable.items, extItem), ({ name }, key) => {
      if (2001 <= key && key <= 2004) return name.replace(/作战记录| Battle Record|作戦記録|작전기록/, '');
      return name;
    });
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
                if (!['MAIN', 'SUB'].includes(stageType)) return;
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
    const skillId2Name = _.mapKeys(
      _.mapValues(
        _.omitBy(skillTable, (v, k) => k.startsWith('sktok_')),
        ({ levels }) => levels[0].name
      ),
      (v, k) => idStandardization(k)
    );
    const cultivate = _.transform(
      langShort === 'zh' ? _.pickBy(characterTable, (v, k) => k.startsWith('char_')) : {},
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
            name: idStandardization(skillId),
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
    let buffMd52Description = {};
    const roomEnum2Name = _.mapValues(buildingData.rooms, ({ name }) => name);
    const buildingBuffs = _.transform(
      buildingData.buffs,
      (obj, { buffId, buffName, roomType, description }) => {
        buffId = idStandardization(buffId);
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
        obj.description[buffId] = descriptionMd5;
        obj.info[descriptionMd5] = { building: roomType };
      },
      { description: {}, info: {} }
    );
    const buildingChars = _.transform(
      langShort === 'zh' ? _.pickBy(buildingData.chars, (v, k) => k.startsWith('char_')) : {},
      (obj, { charId, buffChar }) => {
        const shortId = charId.replace(/^char_/, '');
        obj[shortId] = _.flatMap(buffChar, ({ buffData }) =>
          buffData.map(({ buffId, cond: { phase, level } }) => ({
            id: idStandardization(buffId),
            unlock: `${phase}_${level}`,
          }))
        );
      },
      {}
    );
    if (langShort === 'zh') {
      // 找到 MD5 最小不公共前缀以压缩
      let md5Min = 1;
      const md5List = Object.keys(buffMd52Description);
      let currentList;
      do {
        md5Min++;
        currentList = md5List.map(str => str.substr(0, md5Min));
      } while (md5List.length !== _.uniq(currentList).length);
      buffMd52Description = _.mapKeys(buffMd52Description, (v, k) => k.substr(0, md5Min));
      buildingBuffs.description = _.mapValues(buildingBuffs.description, str => str.substr(0, md5Min));
      buildingBuffs.info = _.mapKeys(buildingBuffs.info, (v, k) => k.substr(0, md5Min));
      buildingBuffId2DescriptionMd5 = _.mapValues(buildingBuffId2DescriptionMd5, str => str.substr(0, md5Min));
      Object.freeze(buildingBuffId2DescriptionMd5);
      // 基建技能分类及数值计入
      const { info, numKey } = handleBuildingSkills(buildingBuffs.info, buffMd52Description);
      buildingBuffs.info = info;
      buildingBuffs.numKey = numKey;
    }

    // 写入数据
    const writeLocales = (name, obj) => {
      checkObjs(obj);
      if (writeJSON(Path.join(outputLocalesDir, name), obj)) console.log(`Update ${langShort} ${name}`);
    };
    if (langShort === 'zh') {
      writeData('item.json', material);
      writeData('cultivate.json', cultivate);
      checkObjs(buildingChars, buildingBuffs.description, buildingBuffs.info);
      writeData('building.json', { char: buildingChars, buff: buildingBuffs });
    }
    writeLocales('tag.json', _.invert(tagName2Id));
    writeLocales('character.json', nameId2Name);
    writeLocales('item.json', extItemId2Name);
    writeLocales('material.json', itemId2Name);
    writeLocales('skill.json', skillId2Name);
    checkObjs(roomEnum2Name, buffId2Name, buffMd52Description);
    writeLocales('building.json', {
      name: roomEnum2Name,
      buff: { name: buffId2Name, description: buffMd52Description },
    });
  }
  writeData('character.json', character);
  writeData('unopenedStage.json', unopenedStage);
})();
