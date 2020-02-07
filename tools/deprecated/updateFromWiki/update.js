/*eslint-disable */
const get = require('./modules/autoRetryGet');
const download = require('./modules/autoRetryDownload');
const cnSort = require('./modules/cnSort');
const Cheerio = require('cheerio');
const pinyin = require('pinyin');
const Fse = require('fs-extra');
const Path = require('path');
const _ = require('lodash');

const avatarDir = Path.join(__dirname, '../public/assets/img/avatar');
const joymeURL = 'http://wiki.joyme.com/arknights/%E5%B9%B2%E5%91%98%E6%95%B0%E6%8D%AE%E8%A1%A8';
const materialData = Fse.readJsonSync(Path.join(__dirname, '../src/data/material.json'));
const materials = _.map(materialData, m => m.name);
const materialPinyin = _.transform(
  materialData,
  (o, { name, pinyin }) => {
    o[pinyin] = name;
  },
  {}
);

const JSON_HR = Path.join(__dirname, '../src/data/hr.json');
const JSON_ELITE = Path.join(__dirname, '../src/data/elite.json');
const JSON_BASE_SKILL = Path.join(__dirname, '../src/data/baseSkill.json');

const hrNeed = {
  // name: '干员代号',
  job: '职业',
  star: '星级',
  sex: '性别',
  pub: '获取途径',
  memo: '特性',
  tags: '标签',
};

const ruTranslate = {
  Гум: 'Gummy',
  Истина: 'Istina',
  Зима: 'Zima',
};

function getPinyin(word, style = pinyin.STYLE_NORMAL) {
  const py = pinyin(word, {
    style,
    segment: true,
  });
  return _.flatten(py)
    .join('')
    .toLowerCase()
    .replace(/-/g, '');
}

function getCorrectMaterialName(name) {
  name = name.trim();
  if (materials.includes(name)) return name;
  const pinyin = getPinyin(name);
  if (pinyin in materialPinyin) return materialPinyin[pinyin];
  return null;
}

function copyValue(obj, from, to) {
  if (typeof obj[to] === 'undefined') obj[to] = obj[from];
}

get(joymeURL).then(async r => {
  const $list = Cheerio.load(r, {
    decodeEntities: false,
  });
  const $chars = $list('#CardSelectTr tr');

  const hr = [];
  const elite = {};
  const baseSkill = {};

  for (let i = 1; i < $chars.length; i++) {
    const $infos = $list($chars[i]).find('td');

    // 跳过未实装干员
    if (
      $list($infos[7])
        .text()
        .trim().length === 0 ||
      $list($infos[18])
        .text()
        .match('实装')
    )
      continue;

    const char = {};

    // 获取头像和名字
    const name = $list($infos[1])
      .find('a')
      .text()
      .trim();
    char.name = name;
    const [full, head] = [getPinyin(name), getPinyin(name, pinyin.STYLE_FIRST_LETTER)];
    char.pinyin = { full, head };
    const img = $list($infos[0])
      .find('img')
      .attr('src');
    if (img) {
      const [imgName, imgExt] = _.last(img.split('/')).split('.');
      char.img = {
        name: imgName,
        ext: imgExt,
      };
      await download(img, Path.join(avatarDir, `${full}.${imgExt}`), `Download ${img} as ${full}.${imgExt}`);
    }

    // 获取详细信息
    const $detail = Cheerio.load(
      await get(`http://wiki.joyme.com/arknights/index.php?title=${encodeURIComponent(name)}&action=edit`),
      {
        decodeEntities: false,
      }
    );
    const source = _.transform(
      $detail('#wpTextbox1')
        .text()
        .replace(/{{(?:.*?)\|(.+?)}}/g, '$1')
        .replace(/{{(.*?)}}/g, '$1')
        .match(/(?<={{干员)[\s\S]+?(?=}})/)[0]
        .split('|')
        .map(code => code.trim())
        .filter(code => /^.+?=[\s\S]+$/.test(code)),
      (obj, code) => {
        const {
          groups: { key, value },
        } = /^(?<key>.+?)=(?<value>[\s\S]+)$/.exec(code);
        obj[key] = value.trim();
      },
      {}
    );
    char.en = source.英文名 || full;
    if (ruTranslate[char.en]) char.en = ruTranslate[char.en];

    let check = true;
    _.forEach(hrNeed, (value, key) => {
      if (!check) return;
      if (!source[value]) {
        check = false;
        console.log(`${name}.${value}: ${source[value]}`);
        return;
      }
      char[key] = (() => {
        switch (key) {
          case 'pub':
            return _.includes(source[value], '公开招募');
          case 'tags':
            return cnSort.sortArr(source[value].split(/、| /));
          case 'star':
            return parseInt(source[value]);
          case 'memo':
            return source[value].replace(/[\r\n]+/g, '，');
          default:
            return source[value];
        }
      })();
    });
    if (!check) {
      console.log(`Skip [${name}].`);
      continue;
    }
    hr.push(char);

    // 精英和技能材料
    const eliteTmp = {
      elites: parseElites(source),
      skills: parseSkills(source),
    };
    if (_.sumBy([eliteTmp.elites, eliteTmp.skills.elite, eliteTmp.skills.normal], 'length') > 0) elite[name] = eliteTmp;

    // 基建技能
    baseSkill[name] = parseBaseSkill(source);

    console.log(`Success [${name}].`);
  }

  // 写入文件
  if (!_.isEqual(Fse.readJsonSync(JSON_HR), cnSort.sortArr(hr, 'name'))) {
    Fse.writeJsonSync(JSON_HR, hr);
    require('./updateTimestamp');
    console.log('HR data updated.');
  } else console.log('No need to update HR data.');
  if (!Fse.existsSync(JSON_ELITE) || !_.isEqual(Fse.readJsonSync(JSON_ELITE), cnSort.sortObj(elite))) {
    Fse.writeJsonSync(JSON_ELITE, elite);
    require('./updateTimestamp');
    console.log('Elite data updated.');
  } else console.log('No need to update elite data.');
  if (!Fse.existsSync(JSON_BASE_SKILL) || !_.isEqual(Fse.readJsonSync(JSON_BASE_SKILL), baseSkill)) {
    Fse.writeJsonSync(JSON_BASE_SKILL, baseSkill);
    require('./updateBase');
    require('./updateTimestamp');
    console.log('Base skill data updated.');
  } else console.log('No need to update base skill data.');
});

function parseElites(source) {
  const elites = [];
  const data = _.pickBy(source, (v, k) => /^精\d+材料\d+$/.test(k));
  _.each(data, (v, k) => {
    if (!(v = getCorrectMaterialName(v))) return;
    const index = /^精(?<index>\d+)材料\d+$/.exec(k).groups.index - 1;
    if (!elites[index]) elites[index] = {};
    elites[index][v] = parseInt(source[`${k}数量`]);
  });
  return elites;
}

function parseSkills(source) {
  const normal = [];
  const elite = [];

  const normalData = _.pickBy(source, (v, k) => /^技能\d+→\d+材料$/.test(k));
  _.each(normalData, (value, key) => {
    const index = /^技能(?<index>\d+)→\d+材料$/.exec(key).groups.index - 1;
    if (!normal[index]) normal[index] = {};
    const num = source[`${key}数量`].split('、');
    value.split('、').forEach((v, k) => {
      if (v.startsWith('技巧概要')) return;
      if (!(v = getCorrectMaterialName(v))) return;
      normal[index][v] = parseInt(num[k]);
    });
  });

  const eliteData = _.pickBy(source, (v, k) => /^\d+技能\d+→\d+材料$/.test(k));
  _.each(eliteData, (value, key) => {
    const { skillNo, lvIndex } = /^(?<skillNo>\d+)技能(?<lvIndex>\d+)→\d+材料$/.exec(key).groups;
    const skillIndex = skillNo - 1;
    const index = lvIndex - 7;
    if (!elite[skillIndex]) {
      elite[skillIndex] = {
        name: source[`技能${skillNo}`],
        need: [],
      };
    }
    const { need } = elite[skillIndex];
    const num = source[`${key}数量`].split('、');
    value.split('、').forEach((v, k) => {
      if (v.startsWith('技巧概要')) return;
      if (!(v = getCorrectMaterialName(v))) return;
      if (!need[index]) need[index] = {};
      need[index][v] = parseInt(num[k]);
    });
  });

  return { normal, elite: _.compact(elite) };
}

function parseBaseSkill(source) {
  if (source.基建技能1提升后) {
    copyValue(source, '基建技能1提升后', '基建技能2');
    copyValue(source, '基建技能1提升条件', '基建技能2解锁');
    copyValue(source, '基建技能1提升后设施', '基建技能2设施');
    copyValue(source, '基建技能1提升后效果', '基建技能2效果');
  }
  const baseSkill = [];
  const data = _.pickBy(source, (v, k) => /^基建技能\d+$/.test(k));
  _.each(data, (v, k) => {
    const index = /^基建技能(?<index>\d+)$/.exec(k).groups.index - 1;
    baseSkill[index] = {
      name: v,
      unlock: source[`${k}解锁`],
      building: source[`${k}设施`],
      description: source[`${k}效果`]
        .replace(/％/g, '%')
        .replace(/,/g, '，')
        .replace(/\(/g, '（')
        .replace(/\)/g, '）'),
    };
  });
  return baseSkill;
}
