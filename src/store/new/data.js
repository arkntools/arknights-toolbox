import _ from 'lodash';
import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useHotUpdateStore } from './hotUpdate';
import { langList } from '../lang';

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

export const useDataStore = defineStore('data', () => {
  const hotUpdateStore = useHotUpdateStore();
  const getData = name => hotUpdateStore.dataMap[`data/${name}.json`];
  const getLocale = name => hotUpdateStore.dataMap[`locales/${name}.json`];

  const character = computed(() => getData('character'));
  const material = computed(() => getData('item'));
  const retro = computed(() => getData('retro'));
  const stage = computed(() => getData('stage'));
  const unopenedStage = computed(() => getData('unopenedStage'));
  const zone = computed(() => getData('zone'));

  const characterTable = computed(() =>
    _.mapValues(character.value, (obj, name) => ({ name, ...obj })),
  );
  const characterList = computed(() => Object.values(characterTable.value));

  const eventData = computed(() => {
    const now = Date.now();
    return _.mapValues(stage.value.event, data =>
      _.pickBy(data, ({ valid: { startTs, endTs } }) =>
        _.inRange(now, startTs * 1000, endTs * 1000),
      ),
    );
  });
  const eventStageData = computed(() =>
    _.mapValues(eventData.value, data => {
      const zoneIds = Object.keys(data);
      return new Set(_.flatMap(zoneIds, zoneId => Object.keys(stage.value.event[zoneId] || {})));
    }),
  );

  const materialTable = computed(() =>
    _.mapValues(material.value, (obj, name) => ({ name, ...obj })),
  );
  const materialIdList = computed(() => Object.keys(materialTable.value));
  const materialList = computed(() => _.sortBy(Object.values(materialTable.value), 'sortId.cn'));
  const materials = computed(() => _.groupBy(materialList.value, 'rare'));
  const materialOrder = computed(() =>
    _.mapValues(langList, (v, k) =>
      _.map(_.sortBy(_.filter(materialList.value, `sortId.${k}`), `sortId.${k}`), 'name'),
    ),
  );
  const materialRareFirstOrder = computed(() =>
    _.mapValues(materialOrder.value, order =>
      _.flatten(Object.values(_.groupBy(order, id => materialTable.value[id].rare)).reverse()),
    ),
  );

  const retroData = computed(() => {
    const now = Date.now();
    return _.mapValues(retro.value, (data, server) => {
      // 排除关联活动正在进行的插曲&别传
      const curActIdSet = new Set(
        Object.keys(eventData[server]).map(zoneId => zone.value.zoneToActivity[zoneId]),
      );
      return _.pickBy(
        data,
        ({ startTime, linkedActId }) =>
          startTime * 1000 <= now && linkedActId.every(actId => !curActIdSet.has(actId)),
      );
    });
  });
  const retroStageData = computed(() =>
    _.mapValues(retroData.value, data => {
      return new Set(
        _.flatMap(stage.value.retro, (zone, zoneId) =>
          zone.value.zoneToRetro[zoneId] in data ? Object.keys(zone) : [],
        ).map(id => `${id}_perm`), // 企鹅物流中插曲&别传关卡以 _perm 结尾
      );
    }),
  );

  const fullStageTable = computed(() => ({
    normal: getStagesFromZones(stage.value.normal),
    event: _.mapValues(eventData.value, zones =>
      _.mapValues(getStagesFromZones(_.pick(stage.value.event, Object.keys(zones))), obj => ({
        ...obj,
        event: true,
      })),
    ),
    retro: _.mapValues(retroData.value, retros =>
      _.transform(
        getStagesFromZones(
          _.pickBy(stage.value.retro, (v, zoneId) => zone.value.zoneToRetro[zoneId] in retros),
        ),
        (o, obj, id) => {
          // 企鹅物流中插曲&别传关卡以 _perm 结尾
          o[`${id}_perm`] = { ...obj, retro: true };
        },
        {},
      ),
    ),
  }));
  const getStageTable = server => ({
    ...fullStageTable.value.normal,
    ...fullStageTable.value.event[server],
    ...fullStageTable.value.retro[server],
  });
  const unopenedStageSets = computed(() =>
    _.mapValues(unopenedStage.value, stages => new Set(stages)),
  );

  const enumTagMap = computed(() =>
    _.mapValues(
      _.mapValues(langList, (v, locale) => getLocale(`${locale}/tag`)),
      map => _.mapValues(_.invert(_.omit(map, ['1012', '1013'])), Number),
    ),
  );

  return {
    characterTable,
    characterList,
    eventData,
    eventStageData,
    materialTable,
    materialIdList,
    materialList,
    materials,
    materialOrder,
    materialRareFirstOrder,
    retroData,
    retroStageData,
    fullStageTable,
    getStageTable,
    unopenedStageSets,
    enumTagMap,
  };
});
