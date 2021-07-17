import _ from 'lodash';
import event from '@/data/event.json';
import { event as eventStage } from '@/data/stage.json';

const now = Date.now();

export const eventData = _.mapValues(event, data =>
  _.pickBy(data, ({ valid: { startTs, endTs } }) => startTs * 1000 <= now && now < endTs * 1000),
);

export const eventStageData = _.mapValues(eventData, data => {
  const zoneIds = Object.keys(data);
  return new Set(_.flatMap(zoneIds, zoneId => Object.keys(eventStage[zoneId] || {})));
});
