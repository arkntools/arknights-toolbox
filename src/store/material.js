import _ from 'lodash';
import material from '@/data/item.json';
import { langList } from './lang';

export const MaterialTypeEnum = {
  UNKNOWN: -1,
  MATERIAL: 0,
  CHIP: 1,
  MOD_TOKEN: 2,
  SKILL_SUMMARY: 3,
  CHIP_ASS: 4,
};

const typeAsserts = Object.entries({
  MATERIAL: id => _.inRange(id, 30011, 32000),
  CHIP: id => _.inRange(id, 3211, 3300),
  MOD_TOKEN: id => /^mod_(?:unlock|update)_token/.test(id),
  SKILL_SUMMARY: id => _.inRange(id, 3301, 3310),
  CHIP_ASS: id => String(id) === '32001',
});

_.each(material, (obj, id) => {
  const [typeKey] = typeAsserts.find(([, assert]) => assert(id)) || [];
  if (!typeKey) {
    obj.type = MaterialTypeEnum.UNKNOWN;
    return;
  }
  obj.type = MaterialTypeEnum[typeKey];
});

export const materialTable = _.mapValues(material, (obj, name) => ({ name, ...obj }));
export const materialIdList = Object.keys(materialTable);
export const materialList = _.sortBy(Object.values(materialTable), 'sortId.cn');
export const materials = _.groupBy(materialList, 'rare');
export const materialOrder = _.mapValues(langList, (v, k) =>
  _.map(_.sortBy(_.filter(materialList, `sortId.${k}`), `sortId.${k}`), 'name'),
);
export const materialRareFirstOrder = _.mapValues(materialOrder, order =>
  _.flatten(Object.values(_.groupBy(order, id => materialTable[id].rare)).reverse()),
);

const groupByType = _.groupBy(materialList, 'type');
export const materialTypeGroup = {
  ..._.groupBy(groupByType[MaterialTypeEnum.MATERIAL], 'rare'),
  chip: [...groupByType[MaterialTypeEnum.CHIP_ASS], ...groupByType[MaterialTypeEnum.CHIP]],
  skill: groupByType[MaterialTypeEnum.SKILL_SUMMARY],
  mod: groupByType[MaterialTypeEnum.MOD_TOKEN],
};
export const materialTypeGroupIdSet = _.mapValues(
  materialTypeGroup,
  list => new Set(_.map(list, 'name')),
);

export default {
  MaterialTypeEnum,
  materials,
  materialTypeGroup,
  materialTypeGroupIdSet,
  materialTable,
  materialIdList,
  materialList,
  materialOrder,
  materialRareFirstOrder,
};
