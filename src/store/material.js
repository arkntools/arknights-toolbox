import _ from 'lodash';
import material from '@/data/item.json';

export const materialTable = _.mapValues(material, (obj, name) => ({ name, ...obj }));
export const materialList = Object.values(materialTable);
export const materials = _.groupBy(materialList, ({ rare }) => rare);
export const materialOrder = _.sortBy(_.clone(materialList), 'sortId').map(({ name }) => name);

export default {
  materials,
  materialTable,
  materialList,
  materialOrder,
};
