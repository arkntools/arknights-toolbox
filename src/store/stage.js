import _ from 'lodash';
import stage from '@/data/stage.json';

export const stageTable = {
  ...stage.normal,
  ..._.mapValues(stage.event, obj => ({ ...obj, event: true })),
};

export default {
  stageTable,
};
