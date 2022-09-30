import _ from 'lodash';
import material from '@/data/item.json';
import { langList } from './lang';

export const materialTable = _.mapValues(material, (obj, name) => ({ name, ...obj }));
export const materialList = _.sortBy(Object.values(materialTable), 'sortId.cn');
export const materials = _.groupBy(materialList, ({ rare }) => rare);
export const materialOrder = _.mapValues(langList, (v, k) =>
  _.map(_.sortBy(_.filter(materialList, `sortId.${k}`), `sortId.${k}`), 'name'),
);
export const materialRareFirstOrder = _.mapValues(materialOrder, order =>
  _.flatten(Object.values(_.groupBy(order, id => materialTable[id].rare)).reverse()),
);

export default {
  materials,
  materialTable,
  materialList,
  materialOrder,
  materialRareFirstOrder,
};
