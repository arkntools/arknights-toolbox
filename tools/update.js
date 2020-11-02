/*eslint-disable */
const Axios = require('axios');
const Cheerio = require('cheerio');
const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');
const md5 = require('md5');
const { kanaToRomaji } = require('simple-romaji-kana');
const ac = require('@actions/core');

const get = require('./modules/autoRetryGet');
const { downloadTinied } = require('./modules/autoRetryDownload');
const handleBuildingSkills = require('./modules/handleBuildingSkills');
const { langEnum, langList } = require('../src/store/lang');

const errorLogs = [];
console._error = console.error;
console.error = (...args) => {
  console._error(...args);
  const text = args.join(' ');
  errorLogs.push(text);
};

const avatarDir = Path.resolve(__dirname, '../public/assets/img/avatar');
const prtsHome = 'http://prts.wiki/index.php?title=%E9%A6%96%E9%A1%B5&mobileaction=toggle_view_mobile';
const prtsURL = 'http://prts.wiki/index.php?title=%E5%B9%B2%E5%91%98%E4%B8%80%E8%A7%88&mobileaction=toggle_view_mobile';

const now = Date.now();

const notOperatorIdList = new Set(['504', '505', '506', '507', '508', '509', '510', '511']);
const isOperator = id => {
  const keys = id.split('_');
  return keys[0] === 'char' && !notOperatorIdList.has(keys[1]);
};

const sortObjectBy = (obj, fn) => _.fromPairs(_.sortBy(_.toPairs(obj), ([k, v]) => fn(k, v)));
const idStandardization = id => id.replace(/\[([0-9]+?)\]/g, '_$1');
const getPinyin = (word, style = pinyin.STYLE_NORMAL) => {
  if (/^[\w\s\-]*$/.test(word)) return '';
  const py = pinyin(word, {
    style,
    segment: true,
  });
  return _.flatten(py)
    .join('')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
};
const getRomaji = kana => {
  if (/^[\w\s\-]*$/.test(kana)) return '';
  const romaji = kanaToRomaji(kana);
  return romaji.toLowerCase().replace(/[^a-z]/g, '');
};
const getStageList = stages =>
  _.uniq(
    Object.values(stages)
      .filter(({ stageType }) => ['MAIN', 'SUB'].includes(stageType))
      .map(({ code }) => code)
  );

const getDataURL = lang =>
  _.transform(
    [
      'character_table.json',
      'building_data.json',
      'skill_table.json',
      'gacha_table.json',
      'item_table.json',
      'stage_table.json',
      'zone_table.json',
      'zh_CN/char_patch_table.json',
    ],
    (obj, file) => {
      const paths = file.split('/');
      if (paths.length === 2) {
        const [tLang, tFile] = paths;
        if (tLang === lang) file = tFile;
        else return;
      }
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

const robotTagOwner = ['285_medic2', '286_cast3', '376_therex'];

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
const buildingBuffMigration = {
  dorm_rec_all_020: ['dorm_rec_all_011', buffs => !('dorm_rec_all[011]' in buffs)],
  dorm_rec_all_030: 'dorm_rec_all_013',
  dorm_rec_all_040: 'dorm_rec_all_020',
  dorm_rec_all_050: 'dorm_rec_all_022',
  dorm_rec_all_060: 'dorm_rec_all_021',
  workshop_formula_cost3_000: 'workshop_formula_cost3_111',
  'dorm_rec_all&oneself_013': 'dorm_rec_all&oneself_021',
  manu_formula_spd_220: 'manu_formula_spd_212',
  manu_formula_limit_000: 'manu_formula_limit_0000',
};

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
  const writeData = (name, obj, allowEmpty = false) => {
    if (!allowEmpty) checkObjs(obj);
    if (writeJSON(Path.join(outputDataDir, name), obj)) console.log(`Update ${name}`);
  };

  // 解析数据
  let character;
  let cnStageList = [];
  const unopenedStage = {};
  const eventInfo = {};

  for (const langShort of Object.keys(langList)) {
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
    } = data[langShort];

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
    const charPatchInfo = {};
    if (langShort === 'cn') {
      // 普通
      character = _.transform(
        _.pickBy(characterTable, (v, k) => isOperator(k)),
        (obj, { name, appellation, position, tagList, rarity, profession }, id) => {
          const shortId = id.replace(/^char_/, '');
          const [full, head] = [getPinyin(name), getPinyin(name, pinyin.STYLE_FIRST_LETTER)];
          if (robotTagOwner.includes(shortId) && !tagList.includes('支援机械')) tagList.push('支援机械');
          obj[shortId] = {
            pinyin: { full, head },
            romaji: '',
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
      // 升变
      _.each(charPatchTable.infos, ({ tmplIds }, id) => {
        charPatchInfo[id] = _.without(tmplIds, id);
      });
      Object.freeze(charPatchInfo);
    }
    const nameId2Name = _.transform(
      _.pickBy(characterTable, (v, k) => isOperator(k)),
      (obj, { name }, id) => {
        const shortId = id.replace(/^char_/, '');
        if (langShort === 'jp') character[shortId].romaji = getRomaji(name);
        obj[shortId] = name;
        if (recruitmentList.includes(name)) character[shortId].recruitment.push(langEnum[langShort]);
      },
      {}
    );

    // 下载头像
    if (langShort === 'cn') {
      const missList = Object.keys(nameId2Name).filter(id => !Fse.existsSync(Path.join(avatarDir, `${id}.png`)));
      if (missList.length > 0) {
        // 获取头像列表
        const getThumbAvatar = icon => {
          if (icon.indexOf('/thumb/') !== -1) {
            const paths = icon.split('/');
            paths[paths.length - 1] = '80px-';
            return paths.join('/');
          }
          return `${icon.replace('/images/', '/images/thumb/').replace(/^\/\//, 'http://')}/80px-`;
        };
        const avatarList = _.transform(
          await get(prtsHome).then(html => {
            const $ = Cheerio.load(html, { decodeEntities: false });
            return Array.from($('.mp-operators-content:contains(近期新增) a')).map(a => $(a));
          }),
          (obj, $a) => {
            const name = $a.attr('title');
            const avatar = $a.find('#charicon').attr('data-src');
            if (name && avatar) obj[name] = getThumbAvatar(avatar);
          },
          {}
        );
        if (missList.some(id => !(nameId2Name[id] in avatarList))) {
          await get(prtsURL)
            .then(html => {
              const $ = Cheerio.load(html, { decodeEntities: false });
              const newOperators = Array.from($('.smwdata'));
              newOperators.forEach(data => {
                const $data = $(data);
                const name = $data.attr('data-cn');
                const avatar = $data.attr('data-icon');
                if (name && avatar) avatarList[name] = getThumbAvatar(avatar);
              });
            })
            .catch(console.error);
        }
        const name2Id = _.invert(nameId2Name);
        for (const name in name2Id) {
          if (name in avatarList) {
            const id = name2Id[name];
            // Use download() instead of downloadTinied() if quota of TinyPng exceeded
            await downloadTinied(
              avatarList[name],
              Path.join(avatarDir, `${id}.png`),
              `Download ${avatarList[name]} as ${id}.png`
            ).catch(console.error);
          }
        }
        // 二次检查
        if (Object.keys(nameId2Name).filter(id => !Fse.existsSync(Path.join(avatarDir, `${id}.png`))).length) {
          ac.setOutput('need_retry', true);
          console.warn('Some avatars have not been downloaded.');
        }
      }
    }

    // 未实装关卡
    if (langShort === 'cn') {
      cnStageList = getStageList(stageTable.stages);
      unopenedStage[langShort] = [];
    } else {
      const stageList = getStageList(stageTable.stages);
      unopenedStage[langShort] = _.without(cnStageList, ...stageList);
    }

    // 活动信息
    eventInfo[langShort] = {};
    _.each(zoneTable.zoneValidInfo, (valid, zoneID) => {
      if (zoneTable.zones[zoneID].type === 'ACTIVITY' && now < valid.endTs * 1000)
        eventInfo[langShort][zoneID] = { valid, drop: {} };
    });

    // 关卡信息
    const stage = { normal: {}, event: {} };
    if (langShort === 'cn') {
      _.each(stageTable.stages, ({ stageType, stageId, code, apCost, stageDropInfo: { displayDetailRewards } }) => {
        if (
          ['MAIN', 'SUB', 'ACTIVITY'].includes(stageType) &&
          displayDetailRewards.some(({ type }) => type === 'MATERIAL')
        ) {
          stage[stageType === 'ACTIVITY' ? 'event' : 'normal'][stageId] = { code, cost: apCost };
        }
      });
    }

    const isMaterial = id => /^[0-9]+$/.test(id) && 30000 < id && id < 32000;
    const isChip = id => /^[0-9]+$/.test(id) && 3200 < id && id < 3300;
    const getMaterialListObject = list =>
      _.transform(
        (list || []).filter(({ id }) => isMaterial(id)),
        (obj, { id, count }) => {
          obj[id] = count;
        },
        {}
      );

    // 材料
    const itemId2Name = _.transform(
      _.pickBy(itemTable.items, ({ itemId }) => isMaterial(itemId) || isChip(itemId)),
      (obj, { itemId, name }) => {
        obj[itemId] = name;
      },
      {}
    );
    const extItemId2Name = _.mapValues(_.pick(itemTable.items, extItem), ({ name }, key) => {
      if (2001 <= key && key <= 2004) return name.replace(/作战记录|作戰記錄| Battle Record|作戦記録|작전기록/, '');
      return name;
    });
    const material = _.transform(
      _.pickBy(itemTable.items, ({ itemId }) => isMaterial(itemId)),
      (obj, { itemId, rarity, sortId, stageDropList, buildingProductList }) => {
        if (langShort !== 'cn') return;
        const formula = _.find(buildingProductList, ({ roomType }) => roomType === 'WORKSHOP');
        obj[itemId] = {
          sortId,
          rare: rarity + 1,
          drop: sortObjectBy(
            _.transform(
              stageDropList,
              (drop, { stageId, occPer }) => {
                const { stageType, code, zoneId } = stageTable.stages[stageId];
                if (['MAIN', 'SUB'].includes(stageType)) drop[code] = enumOccPer[occPer];
                else if (stageType === 'ACTIVITY' && zoneId in eventInfo[langShort]) {
                  const eventDrop = eventInfo[langShort][zoneId].drop;
                  if (!eventDrop[itemId]) eventDrop[itemId] = {};
                  eventDrop[itemId][code] = enumOccPer[occPer];
                }
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
      langShort === 'cn' ? _.pickBy(characterTable, (v, k) => isOperator(k)) : {},
      (obj, { phases, allSkillLvlup, skills }, id) => {
        const shortId = id.replace(/^char_/, '');
        // 升变处理
        if (id in charPatchInfo) {
          charPatchInfo[id].forEach(patchId => {
            const unlockStages = charPatchTable.unlockConds[patchId].conds.map(
              ({ stageId }) => stageTable.stages[stageId].code
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
          []
        );
        // 通用技能
        const normal = allSkillLvlup.map(({ lvlUpCost }) => getMaterialListObject(lvlUpCost));
        // 精英技能
        const elite = skills
          .map(({ skillId, levelUpCostCond, isPatch, unlockStages }) => ({
            name: idStandardization(skillId),
            cost: levelUpCostCond.map(({ levelUpCost }) => getMaterialListObject(levelUpCost)),
            ...(isPatch
              ? {
                  isPatch,
                  unlockStages,
                }
              : {}),
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
        if (langShort !== 'cn' && buffId in buildingBuffMigration) {
          const [bufMig, judge] = _.castArray(buildingBuffMigration[buffId]);
          if (!judge || judge(buildingData.buffs)) {
            buffId = bufMig;
          }
        }
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
        if (langShort === 'cn') {
          descriptionMd5 = md5(description);
          buildingBuffId2DescriptionMd5[buffId] = descriptionMd5;
        } else if (buffId in buildingBuffId2DescriptionMd5) {
          descriptionMd5 = buildingBuffId2DescriptionMd5[buffId];
        } else {
          console.error(`Building buff [${buffId}] not found in [${langShort.toUpperCase()}] server`);
          return;
        }
        buffMd52Description[descriptionMd5] = description;
        if (langShort !== 'cn') return;
        obj.description[buffId] = descriptionMd5;
        obj.info[descriptionMd5] = { building: roomType };
      },
      { description: {}, info: {} }
    );
    const buildingChars = _.transform(
      langShort === 'cn' ? _.pickBy(buildingData.chars, (v, k) => isOperator(k)) : {},
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
    if (langShort === 'cn') {
      // 找到 MD5 最小不公共前缀以压缩
      let md5Min = 3;
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
    if (langShort === 'cn') {
      writeData('item.json', material);
      writeData(
        'itemOrder.json',
        _.map(
          _.sortBy(
            _.map(material, ({ sortId }, id) => ({ id, sortId })),
            'sortId'
          ),
          'id'
        )
      );
      writeData('cultivate.json', cultivate);
      checkObjs(buildingChars, ...Object.values(buildingBuffs));
      writeData('building.json', { char: buildingChars, buff: buildingBuffs });
      checkObjs(...Object.values(stage));
      writeData('stage.json', stage);
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
  writeData(
    'event.json',
    _.mapValues(eventInfo, info => _.pickBy(info, ({ drop }) => _.size(drop))),
    true
  );
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
