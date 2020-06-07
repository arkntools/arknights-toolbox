/* eslint-disable no-console */
const _ = require('lodash');
const Fse = require('fs-extra');
const Path = require('path');

const BASESKILL = require('../src/data/baseSkill.json');

const JSON_BASE = Path.join(__dirname, '../src/data/base.json');

const buildings = ['制造站', '贸易站', '发电站', '控制中枢', '宿舍', '会客室', '加工站', '训练室', '人力办公室'];

const keyword = {
  基建设施: {
    发电站: /无人机.*?(?<power>[\d.]+)/,
    人力办公室: /人脉资源.*?(?<connect>[\d.]+)/,
  },
  制造站: {
    通用生产: [/(?<!配方的)生产力(首小时)?\+(?<product>[\d.]+)/, /制造站.+(?<=最多提供)(?<product>[\d.]+)%生产力/],
    贵金属: /贵金属.*?(?<product>[\d.]+)/,
    作战记录: /作战记录.*?(?<product>[\d.]+)/,
    源石: /源石.*?(?<product>[\d.]+)/,
    仓库容量: /仓库容量上限\+(?<capacity>[\d.]+)/,
  },
  贸易站: {
    订单效率: [/(?<!所有贸易站)订单(获取)?效率\+(?<order>[\d.]+)/, /贸易站.+(?<=最多提供)(?<order>[\d.]+)%效率/],
    订单上限: /订单上限\+(?<orderLimit>[\d.]+)/,
  },
  控制中枢: {
    订单效率: /控制中枢.*订单(获取)?效率\+(?<orderAll>[\d.]+)/,
    心情消耗: /控制中枢.*心情(每小时)?消耗-(?<moraleConsume>[\d.]+)/,
  },
  宿舍: {
    群体恢复: /宿舍.*?所有干员.*?(?<moraleRecoveryAll>[\d.]+)/,
    单体恢复: /宿舍.*?某个干员.*?(?<moraleRecoverySingle>[\d.]+)/,
  },
  会客室: {
    无特别加成: /线索.*?速度.*?(?<collect>[\d.]+)((?!更容易).)*$/,
    线索1: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得莱茵生命/, /更容易获得莱茵生命/],
    线索2: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得企鹅物流/, /更容易获得企鹅物流/],
    线索3: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得黑钢国际/, /更容易获得黑钢国际/],
    线索4: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得乌萨斯学生自治团/, /更容易获得乌萨斯学生自治团/],
    线索5: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得格拉斯哥帮/, /更容易获得格拉斯哥帮/],
    线索6: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得喀兰贸易/, /更容易获得喀兰贸易/],
    线索7: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得罗德岛制药/, /更容易获得罗德岛制药/],
  },
  加工站: {
    任意材料: /任意(类?)材料.*?(?<byproduct>[\d.]+)/,
    基建材料: /基建材料.*?(?<byproduct>[\d.]+)/,
    精英材料: /精英材料.*?(?<byproduct>[\d.]+)/,
    技巧概要: /技巧概要.*?(?<byproduct>[\d.]+)/,
    芯片: /芯片.*?(?<byproduct>[\d.]+)/,
  },
  训练室: {
    全能: /，干员.*?(?<train>[\d.]+)/,
    先锋: /先锋.*?(?<train>[\d.]+)/,
    狙击: /狙击.*?(?<train>[\d.]+)/,
    医疗: /医疗.*?(?<train>[\d.]+)/,
    术师: /术师.*?(?<train>[\d.]+)/,
    近卫: /近卫.*?(?<train>[\d.]+)/,
    重装: /重装.*?(?<train>[\d.]+)/,
    辅助: /辅助.*?(?<train>[\d.]+)/,
    特种: /特种.*?(?<train>[\d.]+)/,
  },
};

const regGroupName = {
  基建设施: {
    制造站: ['product', 'capacity'],
    贸易站: ['order', 'orderLimit'],
    发电站: 'power',
    控制中枢: ['orderAll', 'moraleConsume'],
    宿舍: ['moraleRecoveryAll', 'moraleRecoverySingle'],
    会客室: 'collect',
    加工站: 'byproduct',
    训练室: 'train',
    人力办公室: 'connect',
  },
  制造站: {
    通用生产: 'product',
    贵金属: 'product',
    作战记录: 'product',
    源石: 'product',
    仓库容量: 'capacity',
  },
  贸易站: {
    订单效率: 'order',
    订单上限: 'orderLimit',
  },
  控制中枢: {
    订单效率: 'orderAll',
    心情消耗: 'moraleConsume',
  },
  宿舍: {
    群体恢复: 'moraleRecoveryAll',
    单体恢复: 'moraleRecoverySingle',
  },
  会客室: {
    无特别加成: 'collect',
    线索1: 'collect',
    线索2: 'collect',
    线索3: 'collect',
    线索4: 'collect',
    线索5: 'collect',
    线索6: 'collect',
    线索7: 'collect',
  },
  加工站: {
    任意材料: 'byproduct',
    基建材料: 'byproduct',
    精英材料: 'byproduct',
    技巧概要: 'byproduct',
    芯片: 'byproduct',
  },
  训练室: {
    全能: 'train',
    先锋: 'train',
    狙击: 'train',
    医疗: 'train',
    术师: 'train',
    近卫: 'train',
    重装: 'train',
    辅助: 'train',
    特种: 'train',
  },
};

const skillHightlight = html =>
  html
    .replace(/(?<!消耗)((提升)|(\+))([\d.]+%?)/g, '$2{{$3$4}}')
    .replace(/(?<!消耗)-[\d.]+%?(?!心情消耗)|(?<=消耗)\+[\d.]+%?/g, '[[$&]]')
    .replace(
      /(?<=消耗)-[\d.]+%?|-[\d.]+%?(?=心情消耗)|(?<![+-\d.])[\d.]+%?|(?<=每个).{1,8}(?=干员)|(?<=更容易获得).*?(?=线索)|(?<=与).*?(?=在同一个)|(贵金属|作战记录|源石)(?=类)|(?<=目标是).*?(?=，则)|(?<=，).*?(?=干员的?专精)/g,
      '{{$&}}'
    )
    .replace(/{{{{(.*?)}}}}/g, '{{$1}}')
    .replace(/{{}}/g, '');

const unlockShort = {
  初始携带: '-',
  初始获得: '-',
  等级30: '30级',
  等级30级: '30级',
  精英化1: '精1',
  精英化2: '精2',
};

// data

const tag = _.transform(
  _.omit(keyword, '基建设施'),
  (o, v, k) => {
    o[k] = Object.keys(v);
  },
  { 基建设施: buildings }
);

const base = _.transform(
  BASESKILL,
  (arr, skills, name) => {
    skills.forEach(skill => {
      skill.unlock = unlockShort[skill.unlock] || skill.unlock;
      skill.num = {};
      skill.is = {};
    });
    arr.push({ name, skills });
  },
  []
).reverse();

const category = _.transform(
  tag,
  (obj, tags, key) => {
    obj[key] = {};
    tags.forEach(tag => {
      obj[key][tag] = [];
      if (key === '基建设施') {
        base.forEach((item, index) => {
          let condition = false;
          item.skills.forEach(skill => {
            if (skill.building !== tag) return;
            condition = true;
            let regs = keyword.基建设施[tag];
            if (regs) {
              regs = Array.isArray(regs) ? regs : [regs];
              for (const reg of regs) {
                const search = reg.exec(skill.description);
                if (search && search.groups) {
                  _.assign(skill.num, search.groups);
                  break;
                }
              }
            }
          });
          if (condition) obj[key][tag].push(index);
        });
      } else {
        obj.基建设施[key].forEach(index => {
          let condition = false;
          base[index].skills.forEach(skill => {
            if (skill.building !== key) return;
            let regs = keyword[key][tag];
            regs = Array.isArray(regs) ? regs : [regs];
            for (const reg of regs) {
              const search = reg.exec(skill.description);
              if (search) {
                condition = true;
                skill.is[`${key}-${tag}`] = true;
                if (search.groups) {
                  _.assign(skill.num, search.groups);
                  break;
                }
              }
            }
          });
          if (condition) obj[key][tag].push(index);
        });
      }
    });
  },
  {}
);

base.forEach(({ skills }) => {
  skills.forEach(skill => {
    skill.description = skillHightlight(skill.description);
    skill.num = _.mapValues(skill.num, parseFloat);
  });
});

console.log('Update base.');

Fse.writeJsonSync(JSON_BASE, {
  tag,
  buildings,
  base,
  category,
  regGroupName,
});
