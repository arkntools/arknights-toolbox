import _ from 'lodash';
import retro from '@/data/retro.json';
import { retro as retroStage } from '@/data/stage.json';
import { zoneToActivity, zoneToRetro } from '@/data/zone.json';
import { eventData } from './event';

const now = Date.now();

export const retroData = _.mapValues(retro, (data, server) => {
  // 排除关联活动正在进行的插曲&别传
  const curActIdSet = new Set(Object.keys(eventData[server]).map(zoneId => zoneToActivity[zoneId]));
  return _.pickBy(
    data,
    ({ startTime, linkedActId }) =>
      startTime * 1000 <= now && linkedActId.every(actId => !curActIdSet.has(actId)),
  );
});

export const retroStageData = _.mapValues(retroData, data => {
  const retroIdSet = new Set(Object.keys(data));
  return new Set(
    _.flatMap(retroStage, (zone, zoneId) =>
      retroIdSet.has(zoneToRetro[zoneId]) ? Object.keys(zone) : [],
    ).map(id => `${id}_perm`), // 企鹅物流中插曲&别传关卡以 _perm 结尾
  );
});
