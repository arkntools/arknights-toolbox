import _ from 'lodash';
import material from '@/data/item.json';
import { langList } from './lang';

export const MaterialTypeEnum = {
  UNKNOWN: -1,
  MATERIAL: 0,
  CHIP: 1,
  MOD_TOKEN: 2,
  SKILL_BOOK: 3,
  CHIP_ASS: 4,
};

const typeAsserts = Object.entries({
  MATERIAL: id => _.inRange(id, 30011, 32000),
  CHIP: id => _.inRange(id, 3211, 3300),
  MOD_TOKEN: id => /^mod_(?:unlock|update)_token/.test(id),
  SKILL_BOOK: id => _.inRange(id, 3301, 3310),
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
export const materials = _.groupBy(materialList, ({ rare }) => rare);
export const materialOrder = _.mapValues(langList, (v, k) =>
  _.map(_.sortBy(_.filter(materialList, `sortId.${k}`), `sortId.${k}`), 'name'),
);
export const materialRareFirstOrder = _.mapValues(materialOrder, order =>
  _.flatten(Object.values(_.groupBy(order, id => materialTable[id].rare)).reverse()),
);

export default {
  MaterialTypeEnum,
  materials,
  materialTable,
  materialIdList,
  materialList,
  materialOrder,
  materialRareFirstOrder,
};
