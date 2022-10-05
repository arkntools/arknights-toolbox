const Axios = require('axios');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');
const md5 = require('js-md5');
const { transliterate } = require('transliteration');
const JSZip = require('jszip');

const get = require('./modules/autoRetryGet');
const { downloadImageByList } = require('./modules/downloadImage');
const handleBuildingSkills = require('./modules/handleBuildingSkills');
const getPinyin = require('./modules/pinyin');
const getRomaji = require('./modules/romaji');
const { langList: LANG_LIST } = require('../src/store/lang');
const getRichTextCss = require('./modules/getRichTextCss');

const ensureReadJSONSync = (...args) => {
  try {
    return Fse.readJSONSync(...args);
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
};

const errorLogs = [];
console._error = console.error;
console.error = (...args) => {
  console._error(...args);
  const text = args.join(' ');
  errorLogs.push(text);
};

const AVATAR_IMG_DIR = Path.resolve(__dirname, '../public/assets/img/avatar');
const SKILL_IMG_DIR = Path.resolve(__dirname, '../public/assets/img/skill');
const BUILDING_SKILL_IMG_DIR = Path.resolve(__dirname, '../public/assets/img/building_skill');
const ITEM_IMG_DIR = Path.resolve(__dirname, '../public/assets/img/item');
const ITEM_PKG_ZIP = Path.resolve(__dirname, '../src/assets/pkg/item.pkg');
const NOW = Date.now();

const sortObjectBy = (obj, fn) => _.fromPairs(_.sortBy(_.toPairs(obj), ([k, v]) => fn(k, v)));

const idStandardizationMap = new Map();
const idStandardization = id => {
  const result = id.replace(/\[([0-9]+?)\]/g, '_$1');
  if (result !== id) idStandardizationMap.set(result, id);
  return result;
};
const revIdStandardization = result => idStandardizationMap.get(result) || result;

const isOperator = ({ isNotObtainable }, id) => id.split('_')[0] === 'char' && !isNotObtainable;

const isSkillBook = id => _.inRange(id, 3301, 3310);
const isModToken = id => /^mod_(?:unlock|update)_token/.test(id);
const isMaterial = id => _.inRange(id, 30011, 32000);
const isChipAss = id => String(id) === '32001';
const isChip = id => _.inRange(id, 3211, 3300);
const isItem = id =>
  isSkillBook(id) || isModToken(id) || isMaterial(id) || isChipAss(id) || isChip(id);

const getMaterialListObject = list =>
  _.transform(
    (list || []).filter(({ id }) => isItem(id)),
    (obj, { id, count }) => {
      obj[id] = count;
    },
    {},
  );

const formulasKeyMap = {
  WORKSHOP: 'workshopFormulas',
  MANUFACTURE: 'manufactFormulas',
};
const getFormula = (buildingProductList, buildingData) => {
  const formula = _.find(
    buildingProductList,
    ({ roomType }) => roomType === 'WORKSHOP' || roomType === 'MANUFACTURE',
  );
  if (!formula || !(formula.roomType in formulasKeyMap)) return;
  return {
    formulaType: formula.roomType,
    formula: getMaterialListObject(
      buildingData[formulasKeyMap[formula.roomType]][formula.formulaId].costs,
    ),
  };
};

const getEquipMaterialListObject = itemCost => {
  if (!itemCost) return [];
  if (Array.isArray(itemCost)) return [getMaterialListObject(itemCost)];
  return _.map(itemCost, getMaterialListObject);
};
const getStageList = stages => {
  const includeStageType = new Set(['MAIN', 'SUB', 'DAILY']);
  return _.uniq(
    Object.values(stages)
      .filter(({ stageType }) => includeStageType.has(stageType))
      .map(({ code }) => code),
  );
};
const getResourceURL = (repo, branch, path) =>
  process.env.UPDATE_SOURCE === 'cdn'
    ? `https://fastly.jsdelivr.net/gh/${repo}@${branch}/${path}`
    : `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;

const getDataURL = (lang, alternate = false) =>
  _.transform(
    [
      'character_table.json',
      'building_data.json',
      'skill_table.json',
      'gacha_table.json',
      'item_table.json',
      'stage_table.json',
      'zone_table.json',
      'gamedata_const.json',
      'activity_table.json',
      'zh_CN/char_patch_table.json',
      'retro_table.json',
      'uniequip_table.json',
    ],
    (obj, file) => {
      const paths = file.split('/');
      if (paths.length === 2) {
        const [tLang, tFile] = paths;
        if (tLang === lang) file = tFile;
        else return;
      }
      if (!alternate) {
        // 首选
        obj[_.camelCase(file.split('.')[0])] =
          process.env.UPDATE_SOURCE === 'local'
            ? Path.resolve(__dirname, `../../ArknightsGameData/${lang}/gamedata/excel/${file}`)
            : getResourceURL(
                'Kengxxiao/ArknightsGameData',
                'master',
                `${lang}/gamedata/excel/${file}`,
              );
      } else {
        // 备用（已弃用）
        lang = lang.replace('_', '-');
        obj[_.camelCase(file.split('.')[0])] =
          process.env.UPDATE_SOURCE === 'local'
            ? Path.resolve(__dirname, `../../ArknightsData/${lang}/gamedata/excel/${file}`)
            : getResourceURL('Dimbreath/ArknightsData', 'master', `${lang}/gamedata/excel/${file}`);
      }
    },
    {},
  );
const gameData = _.mapValues(LANG_LIST, lang => getDataURL(lang));
// const alternateGameDataURL = _.mapValues(LANG_LIST, lang => getDataURL(lang, true));

// 备用替换
const gameDataReplaceMap = {
  stageTable: ['kr', 'jp', 'en'],
};

const ENUM_POS_AND_PRO = {
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
Object.freeze(ENUM_POS_AND_PRO);

const ENUM_OCC_PER = {
  ALWAYS: 0,
  ALMOST: 1,
  USUAL: 2,
  OFTEN: 3,
  SOMETIMES: 4,
};
Object.freeze(ENUM_OCC_PER);

const EXT_ITEM = ['4001', 'AP_GAMEPLAY', '2001', '2002', '2003', '2004'];

const ROBOT_TAG_NAME_CN = '支援机械';

const OUTPUT_DATA_DIR = Path.resolve(__dirname, '../src/data');
Fse.ensureDirSync(OUTPUT_DATA_DIR);

// 公招干员列表
const getRecruitmentTable = recruitDetail =>
  _.fromPairs(
    _.flatten(
      recruitDetail
        .replace(/\\n/g, '\n')
        .split(/\s*-*\n★+\s*/)
        .splice(1)
        .map(line => line.split(/(?<!<)\/(?!>)/).map(name => name.trim())),
    ).map(name => [name.replace(/^<.+?>(.+?)<\/>$/g, '$1'), name.startsWith('<@rc.eml>') ? 2 : 1]),
  );

// 技能ID与描述MD5对应表
let buildingBuffId2DescriptionMd5 = {};

(async () => {
  // 准备数据
  const dataErrorMap = {};
  for (const langShort in LANG_LIST) {
    const data = gameData[langShort];
    const getData = async url =>
      process.env.UPDATE_SOURCE === 'local' ? ensureReadJSONSync(url) : await get(url);
    for (const key in data) {
      try {
        const obj = await getData(data[key]);
        if (typeof obj === 'string') throw new Error('Not json');
        data[key] = obj;
      } catch (error) {
        console.warn(`Error loading data ${data[key]}`);
        data[key] = null;
        // console.warn(`Use alternate data ${alternateGameDataURL[langShort][key]}`);
        // data[key] = await getData(alternateGameDataURL[langShort][key]);
        if (!(langShort in dataErrorMap)) dataErrorMap[langShort] = {};
        dataErrorMap[langShort][key] = error;
      }
    }
  }
  _.forEach(dataErrorMap, (dataMap, lang) => {
    _.forEach(dataMap, (err, dataName) => {
      const replaces = _.pull(gameDataReplaceMap[dataName], lang);
      if (replaces && replaces.length) {
        const useable = replaces.find(l => gameData[l][dataName]);
        if (useable) {
          gameData[lang][dataName] = gameData[useable][dataName];
          console.warn(`Use ${useable}.${dataName} instead of ${lang}.${dataName}`);
          return;
        }
      }
      console.error(`Cannot replace data ${lang} ${dataName}, origin error:`);
      console.error(err);
    });
  });

  // 写入数据
  const someObjsEmpty = (...objs) => objs.some(obj => _.size(obj) === 0);
  const checkObjsNotEmpty = (...objs) => {
    if (someObjsEmpty(...objs)) throw new Error('Empty object.');
  };
  const writeJSON = (file, obj) => {
    if (!Fse.existsSync(file)) {
      if (someObjsEmpty(obj)) return false;
      Fse.writeJSONSync(file, {});
    }
    if (!_.isEqual(Fse.readJSONSync(file), obj)) {
      Fse.writeJSONSync(file, obj, { spaces: 2 });
      require('./modules/updateTimestamp');
      return true;
    }
    return false;
  };
  const writeText = (file, text) => {
    if (!Fse.existsSync(file) && !text.length) return false;
    Fse.ensureFileSync(file);
    if (Fse.readFileSync(file).toString() !== text) {
      Fse.writeFileSync(file, text);
      require('./modules/updateTimestamp');
      return true;
    }
    return false;
  };
  const writeData = (name, obj, allowEmpty = false) => {
    if (!allowEmpty) checkObjsNotEmpty(obj);
    if (writeJSON(Path.join(OUTPUT_DATA_DIR, name), obj)) console.log(`Update ${name}`);
  };
  const writeFile = (name, text, allowEmpty = false) => {
    if (!allowEmpty && !text.length) throw new Error('Empty content.');
    if (writeText(Path.join(OUTPUT_DATA_DIR, name), text)) console.log(`Update ${name}`);
  };

  // 解析数据
  let character;
  let material;
  let cnStageList = [];
  const unopenedStage = {};
  const eventInfo = {};
  const retroInfo = {};
  const stageInfo = { normal: {}, event: {}, retro: {} };
  const dropInfo = { event: {}, retro: {} };

  for (const langShort of Object.keys(LANG_LIST)) {
    const outputLocalesDir = Path.resolve(__dirname, `../src/locales/${langShort}`);
    Fse.ensureDirSync(outputLocalesDir);

    const {
      characterTable,
      buildingData,
      skillTable,
      gachaTable,
      itemTable,
      stageTable,
      zoneTable,
      charPatchTable,
      gamedataConst,
      activityTable,
      retroTable,
      uniequipTable,
    } = gameData[langShort];
    const isLangCN = langShort === 'cn';

    // 基建技能富文本样式
    if (isLangCN) {
      const className2color = _.transform(
        gamedataConst.richTextStyles,
        (obj, v, k) => {
          if (!k.startsWith('cc.')) return;
          const search = /<color=(#[\dA-F]+)>/.exec(v);
          if (search) obj[k.replace(/[^0-9a-zA-Z]/g, '-')] = search[1];
        },
        {},
      );
      writeFile('richText.css', getRichTextCss(className2color));
    }

    // 基建技能提示
    const termId2term = _.transform(
      gamedataConst.termDescriptionDict,
      (obj, { termName, description }, k) => {
        if (!k.startsWith('cc.')) return;
        obj[k.replace(/\W/g, '_')] = {
          name: termName,
          desc: description,
        };
      },
      {},
    );

    // 标签
    const tagName2Id = _.transform(
      gachaTable.gachaTags,
      (obj, { tagId, tagName }) => {
        obj[tagName] = tagId;
      },
      {},
    );
    Object.freeze(tagName2Id);

    // 角色
    const recruitmentTable = getRecruitmentTable(gachaTable.recruitDetail);
    const charPatchInfo = {};
    if (isLangCN) {
      // 普通
      character = _.transform(
        _.pickBy(characterTable, isOperator),
        (obj, { name, appellation, position, tagList, rarity, profession }, id) => {
          const shortId = id.replace(/^char_/, '');
          if (rarity === 0 && !tagList.includes(ROBOT_TAG_NAME_CN)) {
            tagList.push(ROBOT_TAG_NAME_CN);
          }
          obj[shortId] = {
            pinyin: getPinyin(name),
            romaji: '',
            appellation: transliterate(appellation),
            star: rarity + 1,
            recruitment: {},
            position: ENUM_POS_AND_PRO[position],
            profession: ENUM_POS_AND_PRO[profession],
            tags: tagList.map(tagName => tagName2Id[tagName]).filter(_.isNumber),
          };
        },
        {},
      );
      Object.freeze(character);
      // 升变
      _.each(charPatchTable.infos, ({ tmplIds }, id) => {
        charPatchInfo[id] = _.without(tmplIds, id);
      });
      Object.freeze(charPatchInfo);
    }
    const nameId2Name = _.transform(
      _.pickBy(characterTable, isOperator),
      (obj, { name }, id) => {
        const shortId = id.replace(/^char_/, '');
        if (langShort === 'jp') character[shortId].romaji = getRomaji(name);
        obj[shortId] = name.trim();
        if (name in recruitmentTable) {
          character[shortId].recruitment[langShort] = recruitmentTable[name];
        }
      },
      {},
    );
    if (langShort === 'jp') {
      for (const [id, name] of Object.entries(nameId2Name)) {
        character[id].romaji = await getRomaji(name);
      }
    }

    // 下载头像
    if (isLangCN) {
      await downloadImageByList({
        idList: Object.keys(nameId2Name),
        dirPath: AVATAR_IMG_DIR,
        resPathGetter: id => `avatar/char_${id}.png`,
        resize: 80,
      });
    }

    // 未实装关卡
    if (isLangCN) {
      cnStageList = getStageList(stageTable.stages);
      unopenedStage[langShort] = [];
    } else {
      const stageList = getStageList(stageTable.stages);
      unopenedStage[langShort] = _.without(cnStageList, ...stageList);
    }

    // 活动信息
    eventInfo[langShort] = {};
    _.each(zoneTable.zoneValidInfo, (valid, zoneID) => {
      if (zoneTable.zones[zoneID].type === 'ACTIVITY' && NOW < valid.endTs * 1000) {
        eventInfo[langShort][zoneID] = { valid };
      }
    });

    // 活动掉落
    const existEventDropZoneSet = new Set(Object.keys(dropInfo.event));
    _.each(
      _.pickBy(
        stageTable.stages,
        ({ stageType, zoneId }) => stageType === 'ACTIVITY' && !existEventDropZoneSet.has(zoneId),
      ),
      ({ code, zoneId, stageDropInfo: { displayRewards, displayDetailRewards } }) => {
        const mainRewardIds = new Set(
          _.map(
            displayRewards.filter(({ id, dropType }) => isItem(id) && dropType !== 1),
            'id',
          ),
        );
        displayDetailRewards
          .filter(({ id }) => mainRewardIds.has(id))
          .forEach(({ id, occPercent }) => {
            if (!(zoneId in dropInfo.event)) dropInfo.event[zoneId] = {};
            const eventDrop = dropInfo.event[zoneId];
            if (!(id in eventDrop)) eventDrop[id] = {};
            eventDrop[id][code] = occPercent;
          });
      },
    );
    // _.each(
    //   _.pickBy(itemTable.items, ({ itemId }) => isMaterial(itemId)),
    //   ({ itemId, stageDropList }) => {
    //     stageDropList.forEach(({ stageId, occPer }) => {
    //       const { stageType, code, zoneId } = stageTable.stages[stageId];
    //       if (stageType !== 'ACTIVITY' || existEventDropZoneSet.has(zoneId)) return;
    //       if (!(zoneId in dropInfo.event)) dropInfo.event[zoneId] = {};
    //       const eventDrop = dropInfo.event[zoneId];
    //       if (!(itemId in eventDrop)) eventDrop[itemId] = {};
    //       eventDrop[itemId][code] = ENUM_OCC_PER[occPer];
    //     });
    //   },
    // );

    // 插曲&别传信息
    retroInfo[langShort] = {};
    if (retroTable) {
      _.each(retroTable.retroActList, item => {
        retroInfo[langShort][item.retroId] = _.pick(item, ['type', 'startTime', 'linkedActId']);
      });
    }

    // 插曲&别传掉落
    if (retroTable) {
      const existRetroDropZoneSet = new Set(Object.keys(dropInfo.retro));
      _.each(retroTable.stageList, ({ zoneId, code, stageDropInfo }) => {
        if (existRetroDropZoneSet.has(zoneId)) return;
        const rewardTable = _.mapKeys(stageDropInfo.displayDetailRewards, 'id');
        stageDropInfo.displayRewards.forEach(({ id }) => {
          if (!isItem(id)) return;
          if (!(zoneId in dropInfo.retro)) dropInfo.retro[zoneId] = {};
          const eventDrop = dropInfo.retro[zoneId];
          if (!(id in eventDrop)) eventDrop[id] = {};
          eventDrop[id][code] = rewardTable[id].occPercent;
        });
      });
    }

    // 章节信息
    const zoneId2Name = {
      // 主线
      ..._.transform(
        zoneTable.zones,
        (obj, { type, zoneID, zoneNameFirst, zoneNameSecond }) => {
          if (type === 'MAINLINE') {
            obj[zoneID] = zoneNameFirst || zoneNameSecond;
          }
        },
        {},
      ),
      // 活动
      ..._.transform(
        activityTable.basicInfo,
        (obj, { id, type, name }) => {
          if (type.startsWith('TYPE_ACT') || ['MINISTORY', 'DEFAULT'].includes(type)) {
            obj[id] = isLangCN ? name.replace('·', '・') : name;
          }
        },
        {},
      ),
      // 插曲&别传
      ...(retroTable
        ? _.mapValues(
            retroTable.retroActList,
            ({ type, name }) => `${name}@:(retroNameAppend.${type})`,
          )
        : {}),
    };

    // 关卡信息
    const validStages = _.pickBy(stageTable.stages, stage =>
      stage.stageDropInfo.displayDetailRewards.some(({ type }) => type === 'MATERIAL'),
    );
    if (isLangCN) {
      // 主线 & 活动
      _.each(validStages, ({ stageType, stageId, zoneId, code, apCost }) => {
        if (!['MAIN', 'SUB'].includes(stageType)) return;
        if (!(zoneId in stageInfo.normal)) stageInfo.normal[zoneId] = {};
        stageInfo.normal[zoneId][stageId] = { code, cost: apCost };
      });
    }
    // 活动
    const existEventZoneSet = new Set(Object.keys(stageInfo.event));
    _.each(validStages, ({ stageType, stageId, zoneId, code, apCost }) => {
      if (stageType !== 'ACTIVITY' || existEventZoneSet.has(zoneId)) return;
      if (!(zoneId in stageInfo.event)) stageInfo.event[zoneId] = {};
      stageInfo.event[zoneId][stageId] = { code, cost: apCost };
    });
    // 插曲&别传
    if (retroTable) {
      const existRetroZoneSet = new Set(Object.keys(stageInfo.retro));
      _.each(
        retroTable.stageList,
        ({ stageId, zoneId, code, apCost, stageDropInfo: { displayDetailRewards } }) => {
          if (
            !displayDetailRewards.some(({ type }) => type === 'MATERIAL') ||
            existRetroZoneSet.has(zoneId)
          ) {
            return;
          }
          if (!(zoneId in stageInfo.retro)) stageInfo.retro[zoneId] = {};
          stageInfo.retro[zoneId][stageId] = { code, cost: apCost };
        },
      );
    }

    // 材料
    const itemId2Name = _.transform(
      _.pickBy(itemTable.items, ({ itemId }) => isItem(itemId)),
      (obj, { itemId, name }) => {
        obj[itemId] = name;
      },
      {},
    );
    const extItemId2Name = _.mapValues(_.pick(itemTable.items, EXT_ITEM), ({ name }, key) =>
      2001 <= key && key <= 2004
        ? name.replace(/作战记录|作戰記錄| Battle Record|作戦記録|작전기록/, '')
        : name,
    );
    if (isLangCN) {
      material = _.transform(
        _.pickBy(itemTable.items, ({ itemId }) => isItem(itemId)),
        (obj, { itemId, rarity, sortId, stageDropList, buildingProductList }) => {
          obj[itemId] = {
            sortId: {
              [langShort]: sortId,
            },
            rare: rarity + 1,
            drop: sortObjectBy(
              _.transform(
                stageDropList,
                (drop, { stageId, occPer }) => {
                  const { stageType, code } = stageTable.stages[stageId];
                  if (['MAIN', 'SUB'].includes(stageType)) drop[code] = ENUM_OCC_PER[occPer];
                },
                {},
              ),
              k =>
                k
                  .replace(/^[^0-9]+/, '')
                  .split('-')
                  .map(c => _.pad(c, 3, '0'))
                  .join(''),
            ),
            ...getFormula(buildingProductList, buildingData),
          };
        },
        {},
      );
    } else {
      _.each(
        _.pickBy(itemTable.items, ({ itemId }) => itemId in material),
        ({ itemId, sortId }) => {
          material[itemId].sortId[langShort] = sortId;
        },
      );
    }

    // 下载材料图片
    if (isLangCN) {
      const itemIdList = Object.keys(itemId2Name);
      const failedIdList = await downloadImageByList({
        idList: itemIdList,
        dirPath: ITEM_IMG_DIR,
        resPathGetter: id => `item/${itemTable.items[id].iconId}.png`,
      });
      // 打包材料图片
      const curHaveItemImgs = _.without(itemIdList, ...failedIdList)
        .filter(isItem)
        .map(id => `${id}.png`)
        .sort();
      const needPackageItemImgs = await (async () => {
        if (!Fse.existsSync(ITEM_PKG_ZIP)) return true;
        try {
          const itemImgPkg = await JSZip.loadAsync(Fse.readFileSync(ITEM_PKG_ZIP));
          const curPackagedItemImgs = _.map(
            itemImgPkg.filter(filename => isItem(Path.parse(filename).name)),
            'name',
          ).sort();
          return !_.isEqual(curHaveItemImgs, curPackagedItemImgs);
        } catch (e) {
          console.warn('Check packaged item images error:');
          console.warn(e);
        }
      })();
      if (needPackageItemImgs) {
        try {
          const zip = new JSZip();
          curHaveItemImgs.forEach(filename => {
            zip.file(filename, Fse.createReadStream(Path.join(ITEM_IMG_DIR, filename)));
          });
          zip.generateAsync({ type: 'nodebuffer' }).then(buffer => {
            Fse.writeFileSync(ITEM_PKG_ZIP, buffer);
            console.log('Item images have been packaged.');
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 精英化 & 技能 & 模组
    const opSkillTable = _.mapKeys(
      _.omitBy(skillTable, (v, k) => k.startsWith('sktok_')),
      (v, k) => idStandardization(k),
    );
    const skillId2Name = _.mapValues(opSkillTable, ({ levels }) => levels[0].name);
    const skillId2AddonInfo = _.mapValues(opSkillTable, ({ iconId }) =>
      iconId ? { icon: idStandardization(iconId) } : undefined,
    );
    const uniequipId2Name = _.mapValues(
      _.pickBy(
        uniequipTable ? uniequipTable.equipDict : {},
        ({ itemCost }) =>
          itemCost &&
          // 新版模组有分级，itemCost 从数组变成对象了
          (Array.isArray(itemCost)
            ? itemCost.some(({ id }) => isItem(id))
            : _.some(itemCost, cost => cost.some(({ id }) => isItem(id)))),
      ),
      'uniEquipName',
    );
    const cultivate = _.transform(
      isLangCN ? _.pickBy(characterTable, isOperator) : {},
      (obj, { phases, allSkillLvlup, skills }, id) => {
        const shortId = id.replace(/^char_/, '');
        // 升变处理
        if (id in charPatchInfo) {
          charPatchInfo[id].forEach(patchId => {
            const unlockStages = charPatchTable.unlockConds[patchId].conds.map(
              ({ stageId }) => stageTable.stages[stageId].code,
            );
            const patchSkills = charPatchTable.patchChars[patchId].skills;
            patchSkills.forEach(skill => {
              skill.isPatch = true;
              skill.unlockStages = unlockStages;
            });
            skills.push(...patchSkills);
          });
        }
        // 精英化
        const evolve = _.transform(
          phases,
          (arr, { evolveCost }) => {
            if (evolveCost) arr.push(getMaterialListObject(evolveCost));
          },
          [],
        );
        // 通用技能
        const normal = allSkillLvlup.map(({ lvlUpCost }) => getMaterialListObject(lvlUpCost));
        // 精英技能
        const elite = skills
          .map(({ skillId, levelUpCostCond, isPatch, unlockStages }) => ({
            name: idStandardization(skillId),
            ...skillId2AddonInfo[skillId],
            cost: levelUpCostCond.map(({ levelUpCost }) => getMaterialListObject(levelUpCost)),
            ...(isPatch ? { isPatch, unlockStages } : {}),
          }))
          .filter(({ cost }) => cost.length);
        // 模组
        const uniequip = _.map(
          _.pickBy(
            uniequipTable.equipDict,
            ({ charId, uniEquipId }) => charId === id && uniEquipId in uniequipId2Name,
          ),
          ({ uniEquipId, itemCost }) => ({
            id: uniEquipId,
            cost: getEquipMaterialListObject(itemCost),
          }),
        );
        const final = {
          evolve: evolve.every(obj => _.size(obj)) ? evolve : [],
          skills: {
            normal,
            elite,
          },
          uniequip,
        };
        if (_.sumBy([final.evolve, normal, elite, uniequip], 'length')) obj[shortId] = final;
      },
      {},
    );

    // 下载技能图标
    if (isLangCN) {
      await downloadImageByList({
        idList: _.map(skillId2AddonInfo, (v, k) => (v && v.icon) || k),
        dirPath: SKILL_IMG_DIR,
        resPathGetter: id => `skill/skill_icon_${revIdStandardization(id)}.png`,
        resize: 72,
      });
    }

    // 基建
    const buffId2Name = {};
    let buffMd52Description = {};
    const roomEnum2Name = _.mapValues(buildingData && buildingData.rooms, ({ name }) => name);
    const buffMigration = (() => {
      if (isLangCN || !buildingData) return {};
      const cnData = gameData.cn.buildingData.chars;
      return _.transform(
        buildingData.chars,
        (map, { buffChar }, cid) => {
          buffChar.forEach(({ buffData }, i) => {
            buffData.forEach(({ buffId }, j) => {
              const cnBuffId = _.get(cnData, [cid, 'buffChar', i, 'buffData', j, 'buffId']);
              if (cnBuffId && cnBuffId !== buffId) map[buffId] = cnBuffId;
            });
          });
        },
        {},
      );
    })();
    const buildingBuffs = _.transform(
      buildingData && buildingData.buffs,
      (obj, { buffId, buffName, skillIcon, roomType, description }) => {
        const stdBuffId = idStandardization(
          !isLangCN && buffId in buffMigration ? buffMigration[buffId] : buffId,
        );
        buffId2Name[stdBuffId] = buffName;
        const descriptionMd5 = (() => {
          if (isLangCN) {
            const dMd5 = md5(description);
            buildingBuffId2DescriptionMd5[stdBuffId] = dMd5;
            return dMd5;
          } else if (stdBuffId in buildingBuffId2DescriptionMd5) {
            return buildingBuffId2DescriptionMd5[stdBuffId];
          }
          console.error(`Building buff "${buffId}" from ${langShort.toUpperCase()} is not in CN`);
        })();
        if (!descriptionMd5) return;
        buffMd52Description[descriptionMd5] = description;
        if (!isLangCN) return;
        obj.description[stdBuffId] = descriptionMd5;
        obj.data[stdBuffId] = { icon: skillIcon };
        obj.info[descriptionMd5] = { building: roomType };
      },
      { description: {}, data: {}, info: {} },
    );
    const buildingChars = _.transform(
      isLangCN ? _.pickBy(buildingData.chars, (c, id) => isOperator(characterTable[id], id)) : {},
      (obj, { charId, buffChar }) => {
        const shortId = charId.replace(/^char_/, '');
        const skills = _.flatMap(buffChar, ({ buffData }) =>
          buffData.map(({ buffId, cond: { phase, level } }) => ({
            id: idStandardization(buffId),
            unlock: `${phase}_${level}`,
          })),
        );
        if (skills.length) obj[shortId] = skills;
      },
      {},
    );
    if (isLangCN) {
      // 找到 MD5 最小不公共前缀以压缩
      let md5Min = 3;
      const md5List = Object.keys(buffMd52Description);
      let currentList;
      do {
        md5Min++;
        currentList = md5List.map(str => str.substr(0, md5Min));
      } while (md5List.length !== _.uniq(currentList).length);
      buffMd52Description = _.mapKeys(buffMd52Description, (v, k) => k.substr(0, md5Min));
      buildingBuffs.description = _.mapValues(buildingBuffs.description, str =>
        str.substr(0, md5Min),
      );
      buildingBuffs.info = _.mapKeys(buildingBuffs.info, (v, k) => k.substr(0, md5Min));
      buildingBuffId2DescriptionMd5 = _.mapValues(buildingBuffId2DescriptionMd5, str =>
        str.substr(0, md5Min),
      );
      Object.freeze(buildingBuffId2DescriptionMd5);
      // 基建技能分类及数值计入
      const { info, numKey } = handleBuildingSkills(buildingBuffs.info, buffMd52Description);
      buildingBuffs.info = info;
      buildingBuffs.numKey = numKey;
      // 合并数据
      _.each(buildingBuffs.data, (data, id) => {
        data.desc = buildingBuffs.description[id];
      });
      delete buildingBuffs.description;
      // 下载图标
      await downloadImageByList({
        idList: _.map(buildingBuffs.data, 'icon'),
        dirPath: BUILDING_SKILL_IMG_DIR,
        resPathGetter: id => `building_skill/${id}.png`,
      });
    }

    // 写入数据
    const writeLocales = (name, obj, allowEmpty = false) => {
      if (!allowEmpty) checkObjsNotEmpty(obj);
      if (writeJSON(Path.join(outputLocalesDir, name), obj)) {
        console.log(`Update ${langShort} ${name}`);
      }
    };
    if (isLangCN) {
      writeData('cultivate.json', cultivate);
      checkObjsNotEmpty(buildingChars, ...Object.values(buildingBuffs));
      writeData('building.json', { char: buildingChars, buff: buildingBuffs });
      writeData('zone.json', {
        zoneToActivity: activityTable.zoneToActivity,
        zoneToRetro: retroTable.zoneToRetro,
      });
    }
    writeLocales('tag.json', _.invert(tagName2Id));
    writeLocales('character.json', nameId2Name);
    writeLocales('item.json', extItemId2Name);
    writeLocales('material.json', itemId2Name);
    writeLocales('skill.json', skillId2Name);
    if (uniequipTable) writeLocales('uniequip.json', uniequipId2Name);
    if (buildingData) {
      checkObjsNotEmpty(roomEnum2Name, buffId2Name, buffMd52Description);
      writeLocales('building.json', {
        name: roomEnum2Name,
        buff: { name: buffId2Name, description: buffMd52Description },
      });
    } else console.warn('Ignore building.json of', langShort);
    writeLocales('zone.json', zoneId2Name);
    writeLocales('term.json', termId2term, true);
  }
  writeData('character.json', character);
  writeData('item.json', material);
  writeData('unopenedStage.json', unopenedStage);
  checkObjsNotEmpty(...Object.values(stageInfo));
  writeData('stage.json', stageInfo);
  writeData('drop.json', dropInfo);
  writeData('retro.json', retroInfo);
  // 活动信息当真正有变化才更新
  (data => {
    const dataPath = Path.join(OUTPUT_DATA_DIR, 'event.json');
    if (!Fse.existsSync(dataPath)) {
      writeJSON(dataPath, data);
      console.log('Update event.json');
      return;
    }
    const needUpdate = (() => {
      const oldData = Fse.readJsonSync(dataPath);
      for (const key in data) {
        if (!(key in oldData)) return true;
        if (!_.isEqual(oldData[key], data[key]) && _.size(data[key])) return true;
      }
      return false;
    })();
    if (needUpdate) {
      writeJSON(dataPath, data);
      console.log('Update event.json');
    }
  })(_.mapValues(eventInfo, info => _.pickBy(info, (v, zoneId) => zoneId in dropInfo.event)));

  console.log('Update completed');
})()
  .catch(console.error)
  .then(() => {
    const { IFTTT_EVENT_KEY } = process.env;
    if (IFTTT_EVENT_KEY && errorLogs.length) {
      const [event, key] = IFTTT_EVENT_KEY.split(':');
      Axios.post(`https://maker.ifttt.com/trigger/${event}/with/key/${key}`, {
        value1: errorLogs.join('\n'),
      }).catch(console.error);
    }
  });
