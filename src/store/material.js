import _ from 'lodash';
import material from '@/data/item.json';

export const materialTable = _.mapValues(material, (obj, name) => ({ name, ...obj }));
export const materialList = _.sortBy(Object.values(materialTable), 'sortId');
export const materials = _.groupBy(materialList, ({ rare }) => rare);
export const materialOrder = materialList.map(({ name }) => name);
export const materialRareFirstOrder = _.flatMap(Object.values(materials).reverse(), group =>
  group.map(({ name }) => name)
);

export default {
  materials,
  materialTable,
  materialList,
  materialOrder,
  materialRareFirstOrder,
};
