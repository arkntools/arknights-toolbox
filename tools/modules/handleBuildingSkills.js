/* eslint-disable no-console */
const _ = require('lodash');

// const buildings = [
//   'MANUFACTURE',
//   'TRADING',
//   'POWER',
//   'CONTROL',
//   'DORMITORY',
//   'MEETING',
//   'WORKSHOP',
//   'TRAINING',
//   'HIRE',
// ];

const category = {
  BUILDING: {
    POWER: /无人机.*?(?<power>[\d.]+)/,
    HIRE: /人脉资源.*?(?<connect>[\d.]+)/,
  },
  MANUFACTURE: {
    通用生产: [/(?<!配方的)生产力(首小时)?\+(?<product>[\d.]+)/, /制造站.+(?<=最多提供)(?<product>[\d.]+)%生产力/],
    贵金属: /贵金属.*?(?<product>[\d.]+)/,
    作战记录: /作战记录.*?(?<product>[\d.]+)/,
    源石: /源石.*?(?<product>[\d.]+)/,
    仓库容量: /仓库容量上限\+(?<capacity>[\d.]+)/,
  },
  TRADING: {
    订单效率: [
      /(?<!所有贸易站)订单(获取)?效率\+(?<order>[\d.]+)/,
      /贸易站.+(?<=最多提供)(?<order>[\d.]+)%效率/,
      /贸易站.+(?<=自身\+)(?<order>[\d.]+)%订单获取效率/,
    ],
    订单上限: /订单上限\+(?<orderLimit>[\d.]+)/,
    高品质: /高品质贵金属订单/,
  },
  CONTROL: {
    订单效率: /控制中枢.*订单(获取)?效率\+(?<orderAll>[\d.]+)/,
    心情消耗: /控制中枢.*心情(每小时)?消耗-(?<moraleConsume>[\d.]+)/,
    线索倾向: /线索倾向/,
  },
  DORMITORY: {
    群体恢复: /宿舍.*?所有干员.*?(?<moraleRecoveryAll>[\d.]+)/,
    单体恢复: /宿舍.*?某个干员.*?(?<moraleRecoverySingle>[\d.]+)/,
  },
  MEETING: {
    无特别加成: /线索.*?速度.*?(?<collect>[\d.]+)((?!更容易).)*$/,
    线索1: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得莱茵生命/, /更容易获得莱茵生命/],
    线索2: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得企鹅物流/, /更容易获得企鹅物流/],
    线索3: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得黑钢国际/, /更容易获得黑钢国际/],
    线索4: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得乌萨斯学生自治团/, /更容易获得乌萨斯学生自治团/],
    线索5: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得格拉斯哥帮/, /更容易获得格拉斯哥帮/],
    线索6: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得喀兰贸易/, /更容易获得喀兰贸易/],
    线索7: [/线索.*?速度.*?(?<collect>[\d.]+).*更容易获得罗德岛制药/, /更容易获得罗德岛制药/],
  },
  WORKSHOP: {
    任意材料: /任意(类?)材料.*?(?<byproduct>[\d.]+)/,
    基建材料: /基建材料.*?(?<byproduct>[\d.]+)/,
    精英材料: /精英材料.*?(?<byproduct>[\d.]+)/,
    技巧概要: /技巧概要.*?(?<byproduct>[\d.]+)/,
    芯片: /芯片.*?(?<byproduct>[\d.]+)/,
    装置: /装置类配方.*?(?<byproduct>[\d.]+)/,
  },
  TRAINING: {
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

const numKey = {
  BUILDING: {
    MANUFACTURE: ['product', 'capacity'],
    TRADING: ['order', 'orderLimit'],
    POWER: 'power',
    CONTROL: ['orderAll', 'moraleConsume'],
    DORMITORY: ['moraleRecoveryAll', 'moraleRecoverySingle'],
    MEETING: 'collect',
    WORKSHOP: 'byproduct',
    TRAINING: 'train',
    HIRE: 'connect',
  },
  MANUFACTURE: {
    通用生产: 'product',
    贵金属: 'product',
    作战记录: 'product',
    源石: 'product',
    仓库容量: 'capacity',
  },
  TRADING: {
    订单效率: 'order',
    订单上限: 'orderLimit',
    高品质: [],
  },
  CONTROL: {
    订单效率: 'orderAll',
    心情消耗: 'moraleConsume',
    线索倾向: [],
  },
  DORMITORY: {
    群体恢复: 'moraleRecoveryAll',
    单体恢复: 'moraleRecoverySingle',
  },
  MEETING: {
    无特别加成: 'collect',
    线索1: 'collect',
    线索2: 'collect',
    线索3: 'collect',
    线索4: 'collect',
    线索5: 'collect',
    线索6: 'collect',
    线索7: 'collect',
  },
  WORKSHOP: {
    任意材料: 'byproduct',
    基建材料: 'byproduct',
    精英材料: 'byproduct',
    技巧概要: 'byproduct',
    芯片: 'byproduct',
    装置: 'byproduct',
  },
  TRAINING: {
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

module.exports = (md52Info, md52Description) => {
  const info = _.mapValues(md52Info, ({ building }, md5) => {
    const is = {};
    const num = {};
    const description = md52Description[md5].replace(/{{|}}|\[\[|\]\]/g, '');
    if (category[building]) {
      _.each(category[building], (value, key) => {
        const regs = _.castArray(value);
        for (const reg of regs) {
          const search = reg.exec(description);
          if (search) {
            is[key] = 1;
            if (search.groups) _.assign(num, search.groups);
            break;
          }
        }
      });
    } else if (category.BUILDING[building]) {
      const value = category.BUILDING[building];
      const regs = _.castArray(value);
      for (const reg of regs) {
        const search = reg.exec(description);
        if (search) {
          if (search.groups) _.assign(num, search.groups);
          break;
        }
      }
    }
    return { building, num: _.mapValues(num, parseFloat), is };
  });
  return { info, numKey };
};
