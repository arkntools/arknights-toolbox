import _ from 'lodash';
import stage from '@/data/stage.json';
import unopenedStage from '@/data/unopenedStage.json';
import { zoneToRetro } from '@/data/zone.json';
import { eventData } from './event';
import { retroData } from './retro';

/**
 * 分割关卡代号
 *
 * @param {string} code
 */
const splitCode = code => {
  const [first = '', second = ''] = code.split('-');
  const firstNum = parseInt(first) || 0;
  const firstCode = first.split(/\d+/)[0];
  return [firstCode, firstNum, parseInt(second) || 0];
};

/**
 * 关卡代号排序
 *
 * @param {string[]} codes
 */
export const sortStageCodes = codes =>
  codes.sort((a, b) => {
    const compares = _.zip(splitCode(a), splitCode(b)).map(([av, bv]) => {
      switch (typeof av) {
        case 'string':
          return av.length === bv.length ? bv.localeCompare(av) : av.length - bv.length;
        case 'number':
          return av - bv;
        default:
          return 0;
      }
    });
    return compares.find(result => result !== 0) || 0;
  });

const getStagesFromZones = zones =>
  _.transform(
    zones,
    (obj, stages, zoneId) => {
      Object.assign(
        obj,
        _.mapValues(stages, stage => ({ zoneId, ...stage })),
      );
    },
    {},
  );

export const fullStageTable = {
  normal: getStagesFromZones(stage.normal),
  event: _.mapValues(eventData, zones =>
    _.mapValues(getStagesFromZones(_.pick(stage.event, Object.keys(zones))), obj => ({
      ...obj,
      event: true,
    })),
  ),
  retro: _.mapValues(retroData, retros =>
    _.transform(
      getStagesFromZones(_.pickBy(stage.retro, (v, zoneId) => zoneToRetro[zoneId] in retros)),
      (o, obj, id) => {
        // 企鹅物流中插曲&别传关卡以 _perm 结尾
        o[`${id}_perm`] = { ...obj, retro: true };
      },
      {},
    ),
  ),
};

export const getStageTable = server => ({
  ...fullStageTable.normal,
  ...fullStageTable.event[server],
  ...fullStageTable.retro[server],
});

export const unopenedStageSets = _.mapValues(unopenedStage, stages => new Set(stages));
