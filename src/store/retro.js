import _ from 'lodash';
import retro from '@/data/retro.json';
import { retro as retroStage } from '@/data/stage.json';
import { zoneToRetro } from '@/data/zone.json';

const now = Date.now();

export const retroData = _.mapValues(retro, data =>
  _.pickBy(data, ({ startTime }) => startTime * 1000 <= now),
);

export const retroStageData = _.mapValues(retroData, data => {
  const retroIdSet = new Set(Object.keys(data));
  return new Set(
    _.flatMap(retroStage, (zone, zoneId) =>
      retroIdSet.has(zoneToRetro[zoneId]) ? Object.keys(zone) : [],
    ),
  );
});
